import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { VehicleService } from '../../core/ports/vehicle.port';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { AuthService } from '../../core/ports/auth.port';
import { UserType } from '../../core/models/user.model';
import { CreateVehicleData, Vehicle } from '../../core/models/vehicle.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { ModalComponent } from '../../presentation/shared/components/modal/modal.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import { TranslatePipe } from '@ngx-translate/core';
import {
  EllipsisVerticalIcon,
  LucideAngularModule,
  ListFilterIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-angular';

/**
 * DashboardPage — Main vehicles dashboard (Figma: "Dashboard Clients & Persons").
 * Shows the user's vehicles as cards with gradient backgrounds.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    ToastComponent,
    TranslatePipe,
    LucideAngularModule,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceLogService = inject(MaintenanceLogService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly SearchIcon = SearchIcon;
  readonly ListFilterIcon = ListFilterIcon;
  readonly EllipsisVerticalIcon = EllipsisVerticalIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;

  vehicles: Vehicle[] = [];
  isLoading = false;
  canManageVehicleActions = false;
  showEditModal = false;
  showDeleteModal = false;
  activeVehicle: Vehicle | null = null;
  toastMessage = '';
  toastVisible = false;
  editVehicleForm!: FormGroup;

  private readonly latestMaintenanceDates = new Map<string, string>();
  private readonly defaultCardColor = '#3B82F6';
  openMenuVehicleId: string | null = null;

  readonly currentYear = new Date().getFullYear();
  readonly minYear = 1886;
  readonly maxYear = this.currentYear + 1;
  readonly cardColorOptions = [
    '#3B82F6',
    '#EC4899',
    '#22C55E',
    '#F97316',
    '#A855F7',
  ];

  ngOnInit(): void {
    this.initializeEditForm();
    this.canManageVehicleActions = this.isVehicleManager(
      this.authService.getUserType(),
    );
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.canManageVehicleActions = this.isVehicleManager(
        user?.userType ?? null,
      );
    });
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isVehicleManager(userType: UserType | null): boolean {
    return userType === UserType.USUARIO || userType === UserType.CLIENTE;
  }

  private initializeEditForm(): void {
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
      color: ['', Validators.maxLength(30)],
      displayName: ['', Validators.maxLength(50)],
      cardColor: ['#3B82F6'],
    });
  }

  private loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService
      .getVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicles) => {
          this.vehicles = vehicles;
          this.loadLatestMaintenanceDates(vehicles);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showToast('errors.loadVehicles');
        },
      });
  }

  private loadLatestMaintenanceDates(vehicles: Vehicle[]): void {
    this.latestMaintenanceDates.clear();
    if (vehicles.length === 0) return;

    forkJoin(
      vehicles.map((vehicle) =>
        this.maintenanceLogService
          .getLogs(vehicle.id, 0, 1)
          .pipe(catchError(() => of(null))),
      ),
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe((responses) => {
        responses.forEach((response, index) => {
          const latestLog = response?.content?.[0];
          if (latestLog) {
            this.latestMaintenanceDates.set(
              vehicles[index].id,
              latestLog.serviceDate,
            );
          }
        });
      });
  }

  formatLastUpdate(vehicle: Vehicle): string {
    const dateString =
      this.latestMaintenanceDates.get(vehicle.id) || vehicle.updatedAt;
    const date = this.parseDateOnly(dateString);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  private parseDateOnly(dateString: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return new Date(dateString);
  }

  getCardBackground(vehicle: Vehicle): string {
    return vehicle.cardColor || this.defaultCardColor;
  }

  viewVehicle(vehicleId: string): void {
    if (this.openMenuVehicleId) {
      this.openMenuVehicleId = null;
      return;
    }
    void this.router.navigate(['/vehicles', vehicleId]);
  }

  toggleVehicleMenu(vehicleId: string, event: Event): void {
    event.stopPropagation();
    if (!this.canManageVehicleActions) return;
    this.openMenuVehicleId =
      this.openMenuVehicleId === vehicleId ? null : vehicleId;
  }

  openEditModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    if (!this.canManageVehicleActions) return;

    this.openMenuVehicleId = null;
    this.activeVehicle = vehicle;
    this.editVehicleForm.patchValue({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate || '',
      color: vehicle.color || '',
      displayName: vehicle.displayName || '',
      cardColor: vehicle.cardColor || '#3B82F6',
    });
    this.showEditModal = true;
  }

  selectCardColor(color: string): void {
    this.editVehicleForm.get('cardColor')?.setValue(color);
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.activeVehicle = null;
    this.editVehicleForm.reset();
  }

  submitEditVehicle(): void {
    if (!this.editVehicleForm.valid || !this.activeVehicle) {
      this.showToast('errors.formInvalid');
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
      ...(formValue.color && { color: formValue.color.trim() }),
      ...(formValue.displayName && {
        displayName: formValue.displayName.trim(),
      }),
      cardColor: formValue.cardColor || this.activeVehicle.cardColor,
      ...(this.activeVehicle.vin && { vin: this.activeVehicle.vin }),
      ...(this.activeVehicle.currentMileage !== undefined && {
        currentMileage: this.activeVehicle.currentMileage,
      }),
    };

    this.vehicleService
      .updateVehicle(this.activeVehicle.id, vehicleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedVehicle) => {
          this.vehicles = this.vehicles.map((vehicle) =>
            vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
          );
          this.closeEditModal();
          this.showToast('vehicles.updateSuccess');
        },
        error: () => {
          this.showToast('errors.updateVehicle');
        },
      });
  }

  openDeleteModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    if (!this.canManageVehicleActions) return;

    this.openMenuVehicleId = null;
    this.activeVehicle = vehicle;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.activeVehicle = null;
  }

  confirmDeleteVehicle(): void {
    if (!this.activeVehicle) return;

    const vehicleId = this.activeVehicle.id;
    this.vehicleService
      .deleteVehicle(vehicleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vehicles = this.vehicles.filter(
            (vehicle) => vehicle.id !== vehicleId,
          );
          this.latestMaintenanceDates.delete(vehicleId);
          this.closeDeleteModal();
          this.showToast('vehicles.deleteSuccess');
        },
        error: () => {
          this.showToast('errors.deleteVehicle');
        },
      });
  }

  getFieldError(fieldName: string): string {
    const control = this.editVehicleForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'validation.required';
    if (control.errors['maxlength']) return 'errors.maxLength';
    if (control.errors['min']) return 'errors.minValue';
    if (control.errors['max']) return 'errors.maxValue';

    return 'errors.invalidField';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.editVehicleForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getYearOptions(): number[] {
    const options: number[] = [];
    for (let year = this.maxYear; year >= this.minYear; year--) {
      options.push(year);
    }
    return options;
  }

  private showToast(messageKey: string): void {
    this.toastMessage = messageKey;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }
}
