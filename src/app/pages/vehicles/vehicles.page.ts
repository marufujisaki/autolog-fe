import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Vehicle, CreateVehicleData } from '../../core/models/vehicle.model';
import { VehicleService } from '../../core/ports/vehicle.port';
import { CardComponent } from '../../presentation/shared/components/card/card.component';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import {
  SelectComponent,
  SelectOption,
} from '../../presentation/shared/components/select/select.component';
import { ModalComponent } from '../../presentation/shared/components/modal/modal.component';
import { LoadingComponent } from '../../presentation/shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../presentation/shared/components/empty-state/empty-state.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

/**
 * VehiclesPage displays the user's vehicles (and shared vehicles for mechanics).
 *
 * Requirements:
 * - 4.2: Return only vehicles owned by that user; IF the user is of type Mecánico,
 *   THEN THE API SHALL also include vehicles shared with the mechanic's workshop
 * - 10.1, 10.2, 10.4: Paginated and ordered display
 */
@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    ModalComponent,
    LoadingComponent,
    EmptyStateComponent,
    ToastComponent,
    TranslatePipe,
  ],
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  vehicles: Vehicle[] = [];
  isLoading = false;
  showCreateModal = false;
  toastMessage = '';
  toastVisible = false;

  createVehicleForm!: FormGroup;

  private destroy$ = new Subject<void>();

  readonly currentYear = new Date().getFullYear();
  readonly minYear = 1886;
  readonly maxYear = this.currentYear + 1;

  ngOnInit(): void {
    this.initializeForm();
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the vehicle creation form with validation.
   * Requirement 4.5: brand, model, year are required; licensePlate, vin, color, currentMileage optional
   */
  private initializeForm(): void {
    this.createVehicleForm = this.formBuilder.group({
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      model: ['', [Validators.required, Validators.maxLength(50)]],
      year: [
        '',
        [
          Validators.required,
          Validators.min(this.minYear),
          Validators.max(this.maxYear),
        ],
      ],
      licensePlate: ['', Validators.maxLength(10)],
      vin: ['', Validators.maxLength(17)],
      color: ['', Validators.maxLength(30)],
      currentMileage: ['', [Validators.min(0), Validators.max(9999999)]],
    });
  }

  /**
   * Load vehicles from the backend.
   * Requirement 4.2: Returns owned vehicles and shared vehicles (for mechanics).
   */
  private loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService
      .getVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicles) => {
          this.vehicles = vehicles;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          this.isLoading = false;
          this.showToast('ERROR_LOADING_VEHICLES');
        },
      });
  }

  /**
   * Open the create vehicle modal.
   */
  openCreateModal(): void {
    this.createVehicleForm.reset();
    this.showCreateModal = true;
  }

  /**
   * Close the create vehicle modal.
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createVehicleForm.reset();
  }

  /**
   * Submit the create vehicle form.
   * Requirement 4.1: Persist vehicle with brand, model, year.
   */
  submitCreateVehicle(): void {
    if (!this.createVehicleForm.valid) {
      this.showToast('FORM_VALIDATION_ERROR');
      return;
    }

    const formValue = this.createVehicleForm.value;
    const vehicleData: CreateVehicleData = {
      brand: formValue.brand.trim(),
      model: formValue.model.trim(),
      year: parseInt(formValue.year, 10),
      ...(formValue.licensePlate && {
        licensePlate: formValue.licensePlate.trim(),
      }),
      ...(formValue.vin && { vin: formValue.vin.trim() }),
      ...(formValue.color && { color: formValue.color.trim() }),
      ...(formValue.currentMileage && {
        currentMileage: parseInt(formValue.currentMileage, 10),
      }),
    };

    this.vehicleService
      .createVehicle(vehicleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicle) => {
          this.vehicles.push(vehicle);
          this.closeCreateModal();
          this.showToast('VEHICLE_CREATED_SUCCESS');
        },
        error: (error) => {
          console.error('Error creating vehicle:', error);
          this.showToast('ERROR_CREATING_VEHICLE');
        },
      });
  }

  /**
   * Navigate to vehicle detail page.
   */
  viewVehicleDetail(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  /**
   * Show toast notification.
   */
  private showToast(messageKey: string): void {
    this.toastMessage = messageKey;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  /**
   * Get error message for a form field.
   */
  getFieldError(fieldName: string): string {
    const control = this.createVehicleForm.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'FIELD_REQUIRED';
    }
    if (control.errors['maxlength']) {
      return `MAX_LENGTH_${control.errors['maxlength'].requiredLength}`;
    }
    if (control.errors['min']) {
      return `MIN_VALUE_${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `MAX_VALUE_${control.errors['max'].max}`;
    }

    return 'INVALID_FIELD';
  }

  /**
   * Check if a form field has an error and has been touched.
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.createVehicleForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get year options for the year select dropdown (last 50 years + next year).
   */
  getYearOptions(): SelectOption[] {
    const options: SelectOption[] = [];
    for (let i = this.maxYear; i >= this.minYear; i--) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  }
}
