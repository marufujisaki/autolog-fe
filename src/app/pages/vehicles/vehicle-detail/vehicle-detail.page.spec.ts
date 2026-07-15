import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { VehicleDetailPage } from './vehicle-detail.page';
import { VehicleService } from '../../../core/ports/vehicle.port';
import { MaintenanceLogService } from '../../../core/ports/maintenance-log.port';
import { Vehicle } from '../../../core/models/vehicle.model';
import {
  MaintenanceLog,
  PaginatedResponse,
} from '../../../core/models/maintenance-log.model';

describe('VehicleDetailPage', () => {
  let component: VehicleDetailPage;
  let fixture: ComponentFixture<VehicleDetailPage>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let maintenanceLogService: jasmine.SpyObj<MaintenanceLogService>;
  let router: jasmine.SpyObj<Router>;
  let translate: jasmine.SpyObj<TranslateService>;
  let paramMapSubject: Subject<any>;

  const mockVehicle: Vehicle = {
    id: 'vehicle-1',
    ownerId: 'owner1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    vin: '12345678901234567',
    color: 'Blue',
    currentMileage: 50000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockLogs: MaintenanceLog[] = [
    {
      id: 'log-1',
      vehicleId: 'vehicle-1',
      createdBy: 'user1',
      serviceDate: '2024-01-15T00:00:00Z',
      mileageAtService: 45000,
      totalCost: 150,
      jobs: [],
      photos: [],
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'log-2',
      vehicleId: 'vehicle-1',
      createdBy: 'user1',
      serviceDate: '2024-01-10T00:00:00Z',
      mileageAtService: 44000,
      totalCost: 100,
      jobs: [],
      photos: [],
      createdAt: '2024-01-10T10:00:00Z',
    },
  ];

  const mockPaginatedLogs: PaginatedResponse<MaintenanceLog> = {
    content: mockLogs,
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    paramMapSubject = new Subject();
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', [
      'getVehicles',
      'getVehicle',
      'createVehicle',
      'updateVehicle',
    ]);
    const maintenanceLogServiceSpy = jasmine.createSpyObj(
      'MaintenanceLogService',
      ['getLogs', 'getLog', 'createLog', 'deleteLog', 'addJob', 'removeJob'],
    );
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['use']);
    translateSpy.currentLanguage = 'es';

    await TestBed.configureTestingModule({
      imports: [VehicleDetailPage, ReactiveFormsModule, TranslatePipe],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: MaintenanceLogService, useValue: maintenanceLogServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    vehicleService = TestBed.inject(
      VehicleService,
    ) as jasmine.SpyObj<VehicleService>;
    maintenanceLogService = TestBed.inject(
      MaintenanceLogService,
    ) as jasmine.SpyObj<MaintenanceLogService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translate = TestBed.inject(
      TranslateService,
    ) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(VehicleDetailPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load vehicle and logs on init', () => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });

      expect(vehicleService.getVehicle).toHaveBeenCalledWith('vehicle-1');
      expect(maintenanceLogService.getLogs).toHaveBeenCalledWith(
        'vehicle-1',
        0,
        20,
      );
      expect(component.vehicle).toEqual(mockVehicle);
      expect(component.logs).toEqual(mockLogs);
    });

    it('should handle error when loading vehicle', () => {
      const error = new Error('Load failed');
      vehicleService.getVehicle.and.returnValue(throwError(() => error));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });

      expect(component.toastMessage).toBe('ERROR_LOADING_VEHICLE');
      expect(component.toastVisible).toBeTrue();
    });

    it('should populate edit form with vehicle data', () => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });

      expect(component.editVehicleForm.get('brand')?.value).toBe('Toyota');
      expect(component.editVehicleForm.get('model')?.value).toBe('Camry');
      expect(component.editVehicleForm.get('year')?.value).toBe(2020);
      expect(component.editVehicleForm.get('licensePlate')?.value).toBe(
        'ABC123',
      );
    });
  });

  describe('logs loading', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should load paginated logs', () => {
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      // Simulate loading logs via component's internal mechanism
      fixture.detectChanges();

      expect(maintenanceLogService.getLogs).toHaveBeenCalledWith(
        'vehicle-1',
        0,
        20,
      );
      expect(component.logs).toEqual(mockLogs);
      expect(component.totalPages).toBe(1);
      expect(component.totalElements).toBe(2);
    });

    it('should handle error when loading logs', () => {
      const error = new Error('Load failed');
      maintenanceLogService.getLogs.and.returnValue(throwError(() => error));

      // Trigger reload
      component.previousPage();

      expect(component.toastMessage).toBe('ERROR_LOADING_LOGS');
      expect(component.toastVisible).toBeTrue();
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should not have next page when on last page', () => {
      component.totalPages = 1;
      component.currentPage = 0;

      expect(component.hasNextPage()).toBeFalse();
    });

    it('should have next page when not on last page', () => {
      component.totalPages = 3;
      component.currentPage = 0;

      expect(component.hasNextPage()).toBeTrue();
    });

    it('should not have previous page on first page', () => {
      component.currentPage = 0;

      expect(component.hasPreviousPage()).toBeFalse();
    });

    it('should have previous page when not on first page', () => {
      component.currentPage = 1;

      expect(component.hasPreviousPage()).toBeTrue();
    });

    it('should navigate to next page', () => {
      component.totalPages = 3;
      component.currentPage = 0;
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      component.nextPage();

      expect(maintenanceLogService.getLogs).toHaveBeenCalledWith(
        'vehicle-1',
        1,
        20,
      );
    });

    it('should navigate to previous page', () => {
      component.currentPage = 1;
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));

      component.previousPage();

      expect(maintenanceLogService.getLogs).toHaveBeenCalledWith(
        'vehicle-1',
        0,
        20,
      );
    });
  });

  describe('edit modal', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should open edit modal', () => {
      component.openEditModal();

      expect(component.showEditModal).toBeTrue();
    });

    it('should close edit modal and restore form', () => {
      component.openEditModal();
      component.editVehicleForm.patchValue({
        brand: 'Honda',
        model: 'Civic',
      });

      component.closeEditModal();

      expect(component.showEditModal).toBeFalse();
      expect(component.editVehicleForm.get('brand')?.value).toBe('Toyota');
    });
  });

  describe('vehicle update', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should update vehicle with valid form', () => {
      const updatedVehicle = { ...mockVehicle, brand: 'Honda', model: 'Civic' };
      vehicleService.updateVehicle.and.returnValue(of(updatedVehicle));

      component.editVehicleForm.patchValue({
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
      });

      component.submitEditVehicle();

      expect(vehicleService.updateVehicle).toHaveBeenCalled();
      expect(component.vehicle).toEqual(updatedVehicle);
      expect(component.showEditModal).toBeFalse();
    });

    it('should not update vehicle with invalid form', () => {
      component.editVehicleForm.patchValue({
        brand: '',
        model: 'Civic',
        year: 2020,
      });

      component.submitEditVehicle();

      expect(vehicleService.updateVehicle).not.toHaveBeenCalled();
      expect(component.toastMessage).toBe('FORM_VALIDATION_ERROR');
    });

    it('should handle error when updating vehicle', () => {
      const error = new Error('Update failed');
      vehicleService.updateVehicle.and.returnValue(throwError(() => error));

      component.editVehicleForm.patchValue({
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
      });

      component.submitEditVehicle();

      expect(component.toastMessage).toBe('ERROR_UPDATING_VEHICLE');
      expect(component.toastVisible).toBeTrue();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should navigate to log detail', () => {
      component.viewLogDetail('log-1');

      expect(router.navigate).toHaveBeenCalledWith(['/logs', 'log-1']);
    });

    it('should navigate to create log', () => {
      component.createLog();

      expect(router.navigate).toHaveBeenCalledWith(['/logs/create'], {
        queryParams: { vehicleId: 'vehicle-1' },
      });
    });

    it('should navigate back to vehicles', () => {
      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/vehicles']);
    });
  });

  describe('date formatting', () => {
    beforeEach(() => {
      vehicleService.getVehicle.and.returnValue(of(mockVehicle));
      maintenanceLogService.getLogs.and.returnValue(of(mockPaginatedLogs));
      fixture.detectChanges();
      paramMapSubject.next({ id: 'vehicle-1' });
    });

    it('should format date correctly', () => {
      const dateString = '2024-01-15T00:00:00Z';
      const formatted = component.formatDate(dateString);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });
});
