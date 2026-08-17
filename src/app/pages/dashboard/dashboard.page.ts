import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
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
import {
  VehicleFormComponent,
  VehicleFormGroup,
} from '../../presentation/shared/components/vehicle-form/vehicle-form.component';
import { ModalComponent } from '../../presentation/shared/components/modal/modal.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import { BrandComponent } from '../../presentation/shared/components/brand/brand.component';
import { ShareVehicleModalComponent } from '../../presentation/shared/components/share-vehicle-modal/share-vehicle-modal.component';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  LucideAngularModule,
  ListFilterIcon,
  PencilIcon,
  SearchIcon,
  Share2Icon,
  Trash2Icon,
  UnlinkIcon,
  XIcon,
} from 'lucide-angular';

type VehicleSortField = 'lastLog' | 'nickname' | 'brand' | 'year';
type SortDirection = 'asc' | 'desc';

interface VehicleSortOption {
  field: VehicleSortField;
  direction: SortDirection;
}

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
    VehicleFormComponent,
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
  readonly CheckIcon = CheckIcon;
  readonly XIcon = XIcon;
  readonly ArrowUpIcon = ArrowUpIcon;
  readonly ArrowDownIcon = ArrowDownIcon;

  @ViewChild('searchInputRef') private searchInputRef?: InputComponent;

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  isLoading = false;

  readonly hasVehicles = computed(() => this.vehiclesSignal().length > 0);

  readonly searchActive = signal(false);
  readonly searchQuery = signal('');

  readonly sortPopupOpen = signal(false);
  readonly sortOption = signal<VehicleSortOption | null>(null);

  /**
   * `latestMaintenanceDates` is a plain Map mutated by `loadLatestMaintenanceDates`
   * (async forkJoin, not itself a signal) — bumped after every mutation so
   * `computed()`s that depend on last-log dates (sort comparator, date range
   * for the sort popup) re-run. Read, never otherwise used, purely to
   * establish the reactive dependency.
   */
  private readonly maintenanceDatesVersion = signal(0);

  readonly displayedVehicles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.vehiclesSignal();
    if (query) {
      list = list.filter((vehicle) =>
        [vehicle.brand, vehicle.model, vehicle.licensePlate, vehicle.displayName]
          .filter((value): value is string => !!value)
          .some((value) => value.toLowerCase().includes(query)),
      );
    }
    const sort = this.sortOption();
    if (!sort) return list;
    this.maintenanceDatesVersion();
    return [...list].sort((a, b) => this.compareVehicles(a, b, sort));
  });

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
  editVehicleForm!: VehicleFormGroup;

  private readonly latestMaintenanceDates = new Map<string, string>();
  private readonly defaultCardColor = '#3B82F6';
  openMenuVehicleId: string | null = null;

  readonly currentYear = new Date().getFullYear();
  readonly minYear = 1886;
  readonly maxYear = this.currentYear + 1;

  /** Reactively refetches on `dataRefresh.refreshTrigger()` changes — no manual reload wiring needed. */
  private readonly vehiclesResource = this.vehicleService.getVehiclesResource();

  constructor() {
    effect(() => {
      this.isLoading = this.vehiclesResource.isLoading();
      const vehicles = this.vehiclesResource.value();
      if (vehicles) {
        this.vehiclesSignal.set(vehicles);
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
    this.editVehicleForm = this.formBuilder.nonNullable.group({
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
    if (vehicles.length === 0) {
      this.maintenanceDatesVersion.update((version) => version + 1);
      return;
    }

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
        this.maintenanceDatesVersion.update((version) => version + 1);
      });
  }

  formatLastUpdate(vehicle: Vehicle): string {
    const date = this.resolveLastLogDate(vehicle);
    if (Number.isNaN(date.getTime())) return '';
    return this.formatDateLabel(date);
  }

  private resolveLastLogDate(vehicle: Vehicle): Date {
    const dateString =
      this.latestMaintenanceDates.get(vehicle.id) || vehicle.updatedAt;
    return this.parseDateOnly(dateString);
  }

  formatDateLabel(date: Date): string {
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
      year: String(vehicle.year),
      licensePlate: vehicle.licensePlate || '',
      color: vehicle.color || '',
      displayName: vehicle.displayName || '',
      cardColor: vehicle.cardColor || '#3B82F6',
    });
    this.showEditModal = true;
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

    const formValue = this.editVehicleForm.getRawValue();
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
          this.vehiclesSignal.update((vehicles) =>
            vehicles.map((vehicle) =>
              vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
            ),
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
          this.vehiclesSignal.update((vehicles) =>
            vehicles.filter((vehicle) => vehicle.id !== vehicleId),
          );
          this.latestMaintenanceDates.delete(vehicleId);
          this.maintenanceDatesVersion.update((version) => version + 1);
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
          this.vehiclesSignal.update((vehicles) =>
            vehicles.filter((vehicle) => vehicle.id !== vehicleId),
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

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  openSearch(): void {
    if (!this.hasVehicles()) return;
    this.searchActive.set(true);
    setTimeout(() => this.searchInputRef?.focus());
  }

  closeSearch(): void {
    this.searchActive.set(false);
    this.searchQuery.set('');
  }

  // ---------------------------------------------------------------------------
  // Sort
  // ---------------------------------------------------------------------------

  openSortPopup(): void {
    if (!this.hasVehicles()) return;
    this.sortPopupOpen.set(true);
  }

  closeSortPopup(): void {
    this.sortPopupOpen.set(false);
  }

  selectSort(field: VehicleSortField, direction: SortDirection): void {
    this.sortOption.set({ field, direction });
    this.closeSortPopup();
  }

  isSortActive(field: VehicleSortField, direction: SortDirection): boolean {
    const sort = this.sortOption();
    return sort?.field === field && sort?.direction === direction;
  }

  clearSort(): void {
    this.sortOption.set(null);
    this.closeSortPopup();
  }

  private compareVehicles(a: Vehicle, b: Vehicle, sort: VehicleSortOption): number {
    const multiplier = sort.direction === 'asc' ? 1 : -1;

    switch (sort.field) {
      case 'lastLog':
        return (
          (this.resolveLastLogDate(a).getTime() - this.resolveLastLogDate(b).getTime()) *
          multiplier
        );
      case 'nickname':
        return (
          (a.displayName || '').localeCompare(b.displayName || '') * multiplier
        );
      case 'brand':
        return a.brand.localeCompare(b.brand) * multiplier;
      case 'year':
        return (a.year - b.year) * multiplier;
    }
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
