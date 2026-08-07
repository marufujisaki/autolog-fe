import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { LogDetailPage } from './log-detail.page';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { MaintenanceType } from '../../core/models/job.model';
import { MaintenanceLog } from '../../core/models/maintenance-log.model';
import { Vehicle } from '../../core/models/vehicle.model';

/**
 * Minimal fake matching the subset of HttpResourceRef<T> the component
 * actually calls (.value()/.isLoading()/.error()). `as unknown as
 * HttpResourceRef<T>` bypasses structural typing for unused members.
 */
function createFakeResource<T>() {
  const valueSignal = signal<T | undefined>(undefined);
  const errorSignal = signal<unknown>(undefined);
  const isLoadingSignal = signal(false);
  const fake = {
    value: valueSignal,
    error: errorSignal,
    isLoading: isLoadingSignal,
    reload: () => true,
    setValue: (v: T | undefined) => valueSignal.set(v),
    setError: (e: unknown) => errorSignal.set(e),
    setLoading: (l: boolean) => isLoadingSignal.set(l),
  };
  return fake as typeof fake & HttpResourceRef<T>;
}

describe('LogDetailPage', () => {
  let component: LogDetailPage;
  let fixture: ComponentFixture<LogDetailPage>;
  let mockLogService: jasmine.SpyObj<MaintenanceLogService>;
  let mockVehicleService: jasmine.SpyObj<VehicleService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let fakeLogResource: ReturnType<typeof createFakeResource<MaintenanceLog>>;
  let fakeVehicleResource: ReturnType<typeof createFakeResource<Vehicle>>;

  const mockLog = {
    id: 'log-123',
    vehicleId: 'vehicle-123',
    createdBy: 'user-123',
    serviceDate: '2025-01-01',
    mileageAtService: 1000,
    totalCost: 100,
    jobs: [
      {
        id: 'job-1',
        logId: 'log-123',
        title: 'Oil Change',
        description: 'Regular oil change',
        cost: 50,
        maintenanceTypes: [MaintenanceType.SERVICE],
        items: [],
        sortOrder: 1,
      },
      {
        id: 'job-2',
        logId: 'log-123',
        title: 'Brake Pads',
        description: 'Replaced front brake pads',
        cost: 50,
        maintenanceTypes: [MaintenanceType.REPLACEMENT],
        items: [],
        sortOrder: 2,
      },
    ],
    photos: [],
    createdAt: '2025-01-01T00:00:00Z',
  } as unknown as MaintenanceLog;

  const mockVehicle = {
    id: 'vehicle-123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
  } as unknown as Vehicle;

  beforeEach(async () => {
    fakeLogResource = createFakeResource<MaintenanceLog>();
    fakeVehicleResource = createFakeResource<Vehicle>();

    mockLogService = jasmine.createSpyObj('MaintenanceLogService', [
      'getLogResource',
      'deleteLog',
    ]);
    mockLogService.getLogResource.and.returnValue(fakeLogResource);

    mockVehicleService = jasmine.createSpyObj('VehicleService', [
      'getVehicleResource',
    ]);
    mockVehicleService.getVehicleResource.and.returnValue(fakeVehicleResource);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'logId') return 'log-123';
            return null;
          },
        },
      },
    };

    // Pre-populate: the fakes aren't reactively gated on the id the way
    // the real httpResource()s are, so setting a value up front is enough
    // for the component's constructor effects to pick up once ngOnInit
    // (triggered by the first fixture.detectChanges()) sets the id signals.
    fakeLogResource.setValue(mockLog);
    fakeVehicleResource.setValue(mockVehicle);

    await TestBed.configureTestingModule({
      imports: [LogDetailPage],
      providers: [
        { provide: MaintenanceLogService, useValue: mockLogService },
        { provide: VehicleService, useValue: mockVehicleService },
        provideTranslateService(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    TestBed.inject(TranslateService).use('en');
    fixture = TestBed.createComponent(LogDetailPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load log on init', () => {
    fixture.detectChanges();
    expect(mockLogService.getLogResource).toHaveBeenCalled();
    expect(component.log).toEqual(mockLog);
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on error', () => {
    fakeLogResource.setValue(undefined);
    fakeLogResource.setError(new Error('Not found'));
    fixture.detectChanges();
    expect(component.isLoading).toBeFalse();
    expect(component.log).toBeNull();
  });

  it('should return sorted jobs by sortOrder', () => {
    fixture.detectChanges();
    const sorted = component.sortedJobs;
    expect(sorted.length).toBe(2);
    expect(sorted[0].sortOrder).toBe(1);
    expect(sorted[1].sortOrder).toBe(2);
  });

  it('should return total cost', () => {
    fixture.detectChanges();
    expect(component.totalCost).toBe(100);
  });

  it('should return 0 total cost when log is null', () => {
    expect(component.totalCost).toBe(0);
  });

  it('should navigate back to vehicle detail', () => {
    fixture.detectChanges();
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/vehicles',
      'vehicle-123',
    ]);
  });

  it('should format date correctly', () => {
    const result = component.formatDate('2025-01-15');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });

  it('should return correct type label', () => {
    const label = component.getTypeLabel(MaintenanceType.SERVICE);
    expect(label).toBe('Service');
  });

  it('should return correct type class', () => {
    const cls = component.getTypeClass(MaintenanceType.REPLACEMENT);
    expect(cls).toBe('label-replacement');
  });

  it('should return empty jobs array when log is null', () => {
    expect(component.sortedJobs).toEqual([]);
  });
});
