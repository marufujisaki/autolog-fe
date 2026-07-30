import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Vehicle } from '../../../core/models/vehicle.model';
import {
  MaintenanceLog,
  PaginatedResponse,
} from '../../../core/models/maintenance-log.model';
import { Job, MaintenanceType } from '../../../core/models/job.model';
import { VehicleService } from '../../../core/ports/vehicle.port';
import { MaintenanceLogService } from '../../../core/ports/maintenance-log.port';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import { LoadingComponent } from '../../../presentation/shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../presentation/shared/components/empty-state/empty-state.component';
import { ToastComponent } from '../../../presentation/shared/components/toast/toast.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  LucideAngularModule,
  CalendarIcon,
  CarFrontIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  CircleIcon,
  Disc3Icon,
  DropletIcon,
  GaugeIcon,
  UserRoundIcon,
  WrenchIcon,
} from 'lucide-angular';

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
    ButtonComponent,
    LoadingComponent,
    EmptyStateComponent,
    ToastComponent,
    TranslatePipe,
    LucideAngularModule,
  ],
  templateUrl: './vehicle-detail.page.html',
  styleUrls: ['./vehicle-detail.page.scss'],
})
export class VehicleDetailPage implements OnInit, OnDestroy {
  private readonly vehicleService = inject(VehicleService);
  private readonly maintenanceLogService = inject(MaintenanceLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly CarFrontIcon = CarFrontIcon;
  readonly GaugeIcon = GaugeIcon;
  readonly CircleDollarSignIcon = CircleDollarSignIcon;
  readonly UserRoundIcon = UserRoundIcon;
  readonly CalendarIcon = CalendarIcon;
  private readonly iconMap: Record<string, any> = {
    droplet: DropletIcon,
    droplets: DropletIcon,
    'disc-3': Disc3Icon,
    wrench: WrenchIcon,
    'circle-dot': CircleIcon,
    circle: CircleIcon,
  };

  vehicle: Vehicle | null = null;
  logs: MaintenanceLog[] = [];
  isLoadingVehicle = false;
  isLoadingLogs = false;
  toastMessage = '';
  toastVisible = false;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  private destroy$ = new Subject<void>();
  private vehicleId: string = '';

  ngOnInit(): void {
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
          this.isLoadingVehicle = false;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.isLoadingVehicle = false;
          this.showToast('errors.loadVehicle');
          // Navigate back to vehicles list if not found
          setTimeout(() => this.router.navigate(['/tabs/vehicles']), 2000);
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
          this.showToast('errors.loadLogs');
        },
      });
  }

  get latestLog(): MaintenanceLog | null {
    return this.logs.reduce<MaintenanceLog | null>((latest, log) => {
      if (!latest) return log;

      const logDate = this.parseDateOnly(log.serviceDate).getTime();
      const latestDate = this.parseDateOnly(latest.serviceDate).getTime();
      if (logDate > latestDate) return log;
      if (logDate < latestDate) return latest;

      return new Date(log.createdAt).getTime() >
        new Date(latest.createdAt).getTime()
        ? log
        : latest;
    }, null);
  }

  getLogTypes(log: MaintenanceLog): MaintenanceType[] {
    const types: MaintenanceType[] = [];
    for (const job of log.jobs || []) {
      for (const type of job.maintenanceTypes || []) {
        if (!types.includes(type)) {
          types.push(type);
        }
      }
    }
    return types;
  }

  getLogTitle(log: MaintenanceLog): string {
    return (log.jobs || [])
      .map((job) => job.title.trim())
      .filter((title) => title.length > 0)
      .join('\n');
  }

  getLogDescription(log: MaintenanceLog): string {
    return (log.jobs || [])
      .map((job) => job.description?.trim() || '')
      .filter((description) => description.length > 0)
      .join(' ');
  }

  getVehicleLabel(): string {
    if (!this.vehicle) {
      return '';
    }
    const baseLabel = `${this.vehicle.brand} ${this.vehicle.model} ${this.vehicle.year}`;
    return this.vehicle.displayName
      ? `${baseLabel} - ${this.vehicle.displayName}`
      : baseLabel;
  }

  formatShortDate(dateString: string): string {
    try {
      const date = this.parseDateOnly(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      const locale =
        this.translate.currentLang?.() === 'en' ? 'en-US' : 'es-ES';
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  /** Return jobs in their persisted display order. */
  getSortedJobs(log: MaintenanceLog): Job[] {
    return [...(log.jobs || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** Include the service charge and all item subtotals in the job total. */
  getJobTotal(job: Job): number {
    const itemsTotal = (job.items || []).reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    );
    return (job.cost || 0) + itemsTotal;
  }

  /** Sum the visible maintenance records for the vehicle summary. */
  getTotalCost(): number {
    return this.logs.reduce(
      (total, log) =>
        total +
        (log.totalCost ??
          (log.jobs || []).reduce(
            (jobTotal, job) => jobTotal + this.getJobTotal(job),
            0,
          )),
      0,
    );
  }

  getTypeClass(type: MaintenanceType): string {
    return `label-${type.toLowerCase()}`;
  }

  getTypeLabel(type: MaintenanceType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getJobIcon(job: Job): any {
    return this.iconMap[job.icon || ''] || Disc3Icon;
  }

  /** Navigate to the selected maintenance record. */
  viewLogDetail(logId: string): void {
    void this.router.navigate(['/log', logId]);
  }

  /**
   * Navigate to create log page.
   */
  createLog(): void {
    void this.router.navigate(['/vehicles', this.vehicleId, 'logs', 'create']);
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
    this.router.navigate(['/tabs/vehicles']);
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
   * Parse date-only service dates as local calendar dates. Using
   * new Date('YYYY-MM-DD') interprets them as UTC and can show the previous
   * day in time zones west of UTC.
   */
  private parseDateOnly(dateString: string): Date {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return new Date(dateString);
  }

  /**
   * Format date for display.
   */
  formatDate(dateString: string): string {
    try {
      const date = this.parseDateOnly(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      const locale =
        this.translate.currentLang?.() === 'en' ? 'en-US' : 'es-ES';
      return date.toLocaleDateString(locale);
    } catch {
      return dateString;
    }
  }
}
