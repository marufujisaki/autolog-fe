import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Vehicle, CreateVehicleData } from '../../../core/models/vehicle.model';
import {
  MaintenanceLog,
  PaginatedResponse,
} from '../../../core/models/maintenance-log.model';
import { VehicleService } from '../../../core/ports/vehicle.port';
import { MaintenanceLogService } from '../../../core/ports/maintenance-log.port';
import { CardComponent } from '../../../presentation/shared/components/card/card.component';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../../presentation/shared/components/input/input.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../presentation/shared/components/select/select.component';
import { ModalComponent } from '../../../presentation/shared/components/modal/modal.component';
import { LoadingComponent } from '../../../presentation/shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../presentation/shared/components/empty-state/empty-state.component';
import { ToastComponent } from '../../../presentation/shared/components/toast/toast.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/**
 * VehicleDetailPage displays a single vehicle's information and paginated maintenance logs.
 *
 * Requirements:
 * - 4.3: Show vehicle details
 * - 10.1, 10.2, 10.4, 10.5: Paginated log list with ordering and metadata
 */
@Component({
  selector: 'app-vehicle-detail',
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
  templateUrl: './vehicle-detail.page.html',
  styleUrls: ['./vehicle-detail.page.scss'],
})
export class VehicleDetailPage implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceLogService = inject(MaintenanceLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  vehicle: Vehicle | null = null;
  logs: MaintenanceLog[] = [];
  isLoadingVehicle = false;
  isLoadingLogs = false;
  showEditModal = false;
  toastMessage = '';
  toastVisible = false;

  editVehicleForm!: FormGroup;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  private destroy$ = new Subject<void>();
  private vehicleId: string = '';

  readonly currentYear = new Date().getFullYear();
  readonly minYear = 1886;
  readonly maxYear = this.currentYear + 1;

  ngOnInit(): void {
    this.initializeForm();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.vehicleId = params.get('id') || '';
      if (this.vehicleId) {
        this.loadVehicle();
        this.loadLogs(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the edit vehicle form.
   */
  private initializeForm(): void {
    this.editVehicleForm = this.formBuilder.group({
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
   * Load vehicle details.
   */
  private loadVehicle(): void {
    this.isLoadingVehicle = true;
    this.vehicleService
      .getVehicle(this.vehicleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
          this.populateEditForm(vehicle);
          this.isLoadingVehicle = false;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.isLoadingVehicle = false;
          this.showToast('ERROR_LOADING_VEHICLE');
          // Navigate back to vehicles list if not found
          setTimeout(() => this.router.navigate(['/vehicles']), 2000);
        },
      });
  }

  /**
   * Load paginated maintenance logs.
   * Requirement 10.1, 10.2: Paginated results ordered by serviceDate DESC
   */
  private loadLogs(page: number): void {
    this.isLoadingLogs = true;
    this.maintenanceLogService
      .getLogs(this.vehicleId, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<MaintenanceLog>) => {
          this.logs = response.content;
          this.currentPage = response.page;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoadingLogs = false;
        },
        error: (error) => {
          console.error('Error loading logs:', error);
          this.isLoadingLogs = false;
          this.showToast('ERROR_LOADING_LOGS');
        },
      });
  }

  /**
   * Populate edit form with vehicle data.
   */
  private populateEditForm(vehicle: Vehicle): void {
    this.editVehicleForm.patchValue({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      color: vehicle.color || '',
      currentMileage: vehicle.currentMileage || '',
    });
  }

  /**
   * Open the edit vehicle modal.
   */
  openEditModal(): void {
    this.showEditModal = true;
  }

  /**
   * Close the edit vehicle modal.
   */
  closeEditModal(): void {
    this.showEditModal = false;
    if (this.vehicle) {
      this.populateEditForm(this.vehicle);
    }
  }

  /**
   * Submit the edit vehicle form.
   */
  submitEditVehicle(): void {
    if (!this.editVehicleForm.valid || !this.vehicle) {
      this.showToast('FORM_VALIDATION_ERROR');
      return;
    }

    const formValue = this.editVehicleForm.value;
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
      .updateVehicle(this.vehicle.id, vehicleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedVehicle) => {
          this.vehicle = updatedVehicle;
          this.closeEditModal();
          this.showToast('VEHICLE_UPDATED_SUCCESS');
        },
        error: (error) => {
          console.error('Error updating vehicle:', error);
          this.showToast('ERROR_UPDATING_VEHICLE');
        },
      });
  }

  /**
   * Navigate to log detail page.
   */
  viewLogDetail(logId: string): void {
    this.router.navigate(['/logs', logId]);
  }

  /**
   * Navigate to create log page.
   */
  createLog(): void {
    this.router.navigate(['/logs/create'], {
      queryParams: { vehicleId: this.vehicleId },
    });
  }

  /**
   * Go to previous page of logs.
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.loadLogs(this.currentPage - 1);
    }
  }

  /**
   * Go to next page of logs.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadLogs(this.currentPage + 1);
    }
  }

  /**
   * Check if next page is available.
   */
  hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  /**
   * Check if previous page is available.
   */
  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  /**
   * Navigate back to vehicles list.
   */
  goBack(): void {
    this.router.navigate(['/vehicles']);
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
    const control = this.editVehicleForm.get(fieldName);
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
    const control = this.editVehicleForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get year options for the year select dropdown.
   */
  getYearOptions(): SelectOption[] {
    const options: SelectOption[] = [];
    for (let i = this.maxYear; i >= this.minYear; i--) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  }

  /**
   * Format date for display.
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const locale =
        this.translate.currentLang?.() === 'en' ? 'en-US' : 'es-ES';
      return date.toLocaleDateString(locale);
    } catch {
      return dateString;
    }
  }
}
