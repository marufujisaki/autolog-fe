import { Component, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
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
import { ShareService } from '../../core/ports/share.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { TranslationService } from '../../core/services/translation.service';
import { UserType } from '../../core/models/user.model';
import { CreateVehicleData, Vehicle } from '../../core/models/vehicle.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { ModalComponent } from '../../presentation/shared/components/modal/modal.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import { BrandComponent } from '../../presentation/shared/components/brand/brand.component';
import { ShareVehicleModalComponent } from '../../presentation/shared/components/share-vehicle-modal/share-vehicle-modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import {
  EllipsisVerticalIcon,
  LucideAngularModule,
  ListFilterIcon,
  PencilIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
  UnlinkIcon,
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
    BrandComponent,
    ShareVehicleModalComponent,
    TranslatePipe,
    LucideAngularModule,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceLogService = inject(MaintenanceLogService);
  private readonly authService = inject(AuthService);
  private readonly shareService = inject(ShareService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dataRefresh = inject(VehicleDataRefreshService);
  private readonly translationService = inject(TranslationService);
  private readonly destroy$ = new Subject<void>();

  readonly SearchIcon = SearchIcon;
  readonly ListFilterIcon = ListFilterIcon;
  readonly EllipsisVerticalIcon = EllipsisVerticalIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly Share2Icon = Share2Icon;
  readonly UnlinkIcon = UnlinkIcon;

  vehicles: Vehicle[] = [];
  isLoading = false;
  readonly canManageVehicleActions = computed(() =>
    this.isVehicleManager(this.authService.user()?.userType ?? null),
  );
  /** USUARIO owners need `allowSharing` enabled; CLIENTE owners can always share. */
  readonly canShareVehicles = computed(() => {
    const user = this.authService.user();
    if (!user) return false;
    if (user.userType === UserType.CLIENTE) return true;
    return user.userType === UserType.USUARIO && user.allowSharing;
  });
  showEditModal = false;
  showDeleteModal = false;
  showUnlinkModal = false;
  shareModalOpen = false;
  shareModalVehicle: Vehicle | null = null;
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

  /** Reactively refetches on `dataRefresh.refreshTrigger()` changes — no manual reload wiring needed. */
  private readonly vehiclesResource = this.vehicleService.getVehiclesResource();

  constructor() {
    effect(() => {
      this.isLoading = this.vehiclesResource.isLoading();
      const vehicles = this.vehiclesResource.value();
      if (vehicles) {
        this.vehicles = vehicles;
        this.loadLatestMaintenanceDates(vehicles);
      }
      if (this.vehiclesResource.error()) {
        this.showToast('errors.loadVehicles');
      }
    });
  }

  ngOnInit(): void {
    this.initializeEditForm();
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


  private loadLatestMaintenanceDates(vehicles: Vehicle[]): void {
    this.latestMaintenanceDates.clear();
    if (vehicles.length === 0) return;

    forkJoin(
      vehicles.map((vehicle) =>
        this.maintenanceLogService
          .getLogsPage(vehicle.id, 0, 1)
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

    const locale = this.translationService.getCurrentLanguage() === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
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

  /** True for vehicles a MECANICO has been shared access to (not their own). */
  isSharedWithMechanic(vehicle: Vehicle): boolean {
    const user = this.authService.user();
    return (
      !!user &&
      user.userType === UserType.MECANICO &&
      vehicle.ownerId !== user.id
    );
  }

  toggleVehicleMenu(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    if (!this.canManageVehicleActions() && !this.isSharedWithMechanic(vehicle)) {
      return;
    }
    this.openMenuVehicleId =
      this.openMenuVehicleId === vehicle.id ? null : vehicle.id;
  }

  openEditModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    if (!this.canManageVehicleActions()) return;

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
    if (!this.canManageVehicleActions()) return;

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

  openShareModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    if (!this.canShareVehicles()) return;

    this.openMenuVehicleId = null;
    this.shareModalVehicle = vehicle;
    this.shareModalOpen = true;
  }

  closeShareModal(): void {
    this.shareModalOpen = false;
    this.shareModalVehicle = null;
  }

  openUnlinkModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    this.openMenuVehicleId = null;
    this.activeVehicle = vehicle;
    this.showUnlinkModal = true;
  }

  closeUnlinkModal(): void {
    this.showUnlinkModal = false;
    this.activeVehicle = null;
  }

  confirmUnlinkVehicle(): void {
    if (!this.activeVehicle) return;

    const vehicleId = this.activeVehicle.id;
    this.shareService
      .unlinkVehicle(vehicleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vehicles = this.vehicles.filter(
            (vehicle) => vehicle.id !== vehicleId,
          );
          this.closeUnlinkModal();
          this.dataRefresh.notifyChanged();
          this.showToast('share.unlinkSuccess');
        },
        error: () => {
          this.closeUnlinkModal();
          this.showToast('share.unlinkError');
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
