import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LogDetailPage } from './log-detail.page';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { MaintenanceType } from '../../core/models/job.model';

describe('LogDetailPage', () => {
  let component: LogDetailPage;
  let fixture: ComponentFixture<LogDetailPage>;
  let mockLogService: jasmine.SpyObj<MaintenanceLogService>;
  let mockRouter: jasmine.SpyObj<Router>;

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
        sortOrder: 1,
      },
      {
        id: 'job-2',
        logId: 'log-123',
        title: 'Brake Pads',
        description: 'Replaced front brake pads',
        cost: 50,
        maintenanceTypes: [MaintenanceType.REPLACEMENT],
        sortOrder: 2,
      },
    ],
    photos: [],
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    mockLogService = jasmine.createSpyObj('MaintenanceLogService', [
      'getLog',
      'deleteLog',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => {
            if (key === 'logId') return 'log-123';
            if (key === 'vehicleId') return 'vehicle-123';
            return null;
          },
        },
      },
    };

    mockLogService.getLog.and.returnValue(of(mockLog));

    await TestBed.configureTestingModule({
      imports: [LogDetailPage],
      providers: [
        { provide: MaintenanceLogService, useValue: mockLogService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogDetailPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load log on init', () => {
    fixture.detectChanges();
    expect(mockLogService.getLog).toHaveBeenCalledWith('log-123');
    expect(component.log).toEqual(mockLog);
    expect(component.isLoading).toBeFalse();
  });

  it('should set isLoading to false on error', () => {
    mockLogService.getLog.and.returnValue(
      throwError(() => new Error('Not found')),
    );
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
