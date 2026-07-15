import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { VehiclesPage } from './vehicles.page';
import { VehicleService } from '../../core/ports/vehicle.port';
import { Vehicle } from '../../core/models/vehicle.model';

describe('VehiclesPage', () => {
  let component: VehiclesPage;
  let fixture: ComponentFixture<VehiclesPage>;
  let vehicleService: jasmine.SpyObj<VehicleService>;
  let router: jasmine.SpyObj<Router>;
  let translate: jasmine.SpyObj<TranslateService>;

  const mockVehicles: Vehicle[] = [
    {
      id: '1',
      ownerId: 'owner1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: 'ABC123',
      currentMileage: 50000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      ownerId: 'owner1',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'XYZ789',
      currentMileage: 30000,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    const vehicleServiceSpy = jasmine.createSpyObj('VehicleService', [
      'getVehicles',
      'getVehicle',
      'createVehicle',
      'updateVehicle',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['use']);
    translateSpy.currentLang = 'es';

    await TestBed.configureTestingModule({
      imports: [VehiclesPage, ReactiveFormsModule, TranslatePipe],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    }).compileComponents();

    vehicleService = TestBed.inject(
      VehicleService,
    ) as jasmine.SpyObj<VehicleService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translate = TestBed.inject(
      TranslateService,
    ) as jasmine.SpyObj<TranslateService>;

    fixture = TestBed.createComponent(VehiclesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load vehicles on init', () => {
      vehicleService.getVehicles.and.returnValue(of(mockVehicles));

      fixture.detectChanges();

      expect(vehicleService.getVehicles).toHaveBeenCalled();
      expect(component.vehicles).toEqual(mockVehicles);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading vehicles', () => {
      const error = new Error('Load failed');
      vehicleService.getVehicles.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      expect(component.toastMessage).toBe('ERROR_LOADING_VEHICLES');
      expect(component.toastVisible).toBeTrue();
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should initialize form with required validators', () => {
      const brandControl = component.createVehicleForm.get('brand');
      const modelControl = component.createVehicleForm.get('model');
      const yearControl = component.createVehicleForm.get('year');

      expect(brandControl?.hasError('required')).toBeTrue();
      expect(modelControl?.hasError('required')).toBeTrue();
      expect(yearControl?.hasError('required')).toBeTrue();
    });

    it('should validate brand max length', () => {
      const brandControl = component.createVehicleForm.get('brand');
      brandControl?.setValue('a'.repeat(51));

      expect(brandControl?.hasError('maxlength')).toBeTrue();
    });

    it('should validate year range', () => {
      const yearControl = component.createVehicleForm.get('year');

      yearControl?.setValue(1885);
      expect(yearControl?.hasError('min')).toBeTrue();

      yearControl?.setValue(new Date().getFullYear() + 2);
      expect(yearControl?.hasError('max')).toBeTrue();

      yearControl?.setValue(2020);
      expect(yearControl?.hasError('min')).toBeFalse();
      expect(yearControl?.hasError('max')).toBeFalse();
    });
  });

  describe('modal operations', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should open create modal', () => {
      expect(component.showCreateModal).toBeFalse();

      component.openCreateModal();

      expect(component.showCreateModal).toBeTrue();
    });

    it('should close create modal', () => {
      component.showCreateModal = true;
      component.createVehicleForm.patchValue({
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
      });

      component.closeCreateModal();

      expect(component.showCreateModal).toBeFalse();
      expect(component.createVehicleForm.get('brand')?.value).toBe('');
    });
  });

  describe('vehicle creation', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should create vehicle with valid form', () => {
      const newVehicle = mockVehicles[0];
      vehicleService.createVehicle.and.returnValue(of(newVehicle));

      component.createVehicleForm.patchValue({
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        currentMileage: 50000,
      });

      component.submitCreateVehicle();

      expect(vehicleService.createVehicle).toHaveBeenCalledWith({
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        currentMileage: 50000,
      });
      expect(component.vehicles).toContain(newVehicle);
      expect(component.showCreateModal).toBeFalse();
    });

    it('should not create vehicle with invalid form', () => {
      component.createVehicleForm.patchValue({
        brand: '', // Required field empty
        model: 'Camry',
        year: 2020,
      });

      component.submitCreateVehicle();

      expect(vehicleService.createVehicle).not.toHaveBeenCalled();
      expect(component.toastMessage).toBe('FORM_VALIDATION_ERROR');
    });

    it('should handle error when creating vehicle', () => {
      const error = new Error('Creation failed');
      vehicleService.createVehicle.and.returnValue(throwError(() => error));

      component.createVehicleForm.patchValue({
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
      });

      component.submitCreateVehicle();

      expect(component.toastMessage).toBe('ERROR_CREATING_VEHICLE');
      expect(component.toastVisible).toBeTrue();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of(mockVehicles));
      fixture.detectChanges();
    });

    it('should navigate to vehicle detail', () => {
      component.viewVehicleDetail('vehicle-1');

      expect(router.navigate).toHaveBeenCalledWith(['/vehicles', 'vehicle-1']);
    });
  });

  describe('form field errors', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should return required error message', () => {
      const brandControl = component.createVehicleForm.get('brand');
      brandControl?.markAsTouched();

      const errorMsg = component.getFieldError('brand');

      expect(errorMsg).toBe('FIELD_REQUIRED');
    });

    it('should identify field errors correctly', () => {
      const brandControl = component.createVehicleForm.get('brand');
      brandControl?.markAsTouched();

      expect(component.hasFieldError('brand')).toBeTrue();

      brandControl?.setValue('Toyota');
      expect(component.hasFieldError('brand')).toBeFalse();
    });
  });

  describe('year options', () => {
    beforeEach(() => {
      vehicleService.getVehicles.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it('should generate year options', () => {
      const years: number[] = component.getYearOptions() as unknown as number[];

      expect(years.length).toBeGreaterThan(0);
      expect(years[0]).toBe(new Date().getFullYear() + 1);
      expect(years[years.length - 1]).toBe(1886);
    });
  });
});
