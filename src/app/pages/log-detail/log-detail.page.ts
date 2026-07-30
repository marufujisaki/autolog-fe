import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { MaintenanceLog } from '../../core/models/maintenance-log.model';
import { Vehicle } from '../../core/models/vehicle.model';
import { Job, MaintenanceType } from '../../core/models/job.model';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  PencilIcon,
  CarFrontIcon,
  GaugeIcon,
  CircleDollarSignIcon,
  UserRoundIcon,
  CalendarIcon,
  Disc3Icon,
  DropletIcon,
  FilterIcon,
  ThermometerIcon,
  WrenchIcon,
  CircleIcon,
  ZapIcon,
  WindIcon,
  ClockIcon,
  SettingsIcon,
  BatteryIcon,
  BoltIcon,
  PowerIcon,
  LightbulbIcon,
  LinkIcon,
  FlameIcon,
  HammerIcon,
  SnowflakeIcon,
  FanIcon,
  WavesIcon,
  SparklesIcon,
  TruckIcon,
  CloudRainIcon,
  ScaleIcon,
} from 'lucide-angular';

/**
 * LogDetailPage — Maintenance log detail view (Figma: "Detail 2" frame).
 * Shows the real vehicle, mileage at service, mechanic, date, jobs, items and costs.
 */
@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.page.html',
  styleUrls: ['./log-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslatePipe],
})
export class LogDetailPage implements OnInit {
  private readonly logService = inject(MaintenanceLogService);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly PencilIcon = PencilIcon;
  readonly CarFrontIcon = CarFrontIcon;
  readonly GaugeIcon = GaugeIcon;
  readonly CircleDollarSignIcon = CircleDollarSignIcon;
  readonly UserRoundIcon = UserRoundIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly Disc3Icon = Disc3Icon;

  logId = '';
  vehicleId = '';
  log: MaintenanceLog | null = null;
  vehicle: Vehicle | null = null;
  isLoading = true;
  private hasEnteredDetail = false;

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('logId') || '';
    this.loadDetail();
  }

  /**
   * Ionic may reuse this page when returning from the edit route, so ngOnInit
   * is not guaranteed to run again. Reload on every subsequent page entry to
   * show the persisted log instead of the cached pre-edit state.
   */
  ionViewWillEnter(): void {
    if (this.hasEnteredDetail) {
      this.logId = this.route.snapshot.paramMap.get('logId') || this.logId;
      this.loadDetail();
    }
    this.hasEnteredDetail = true;
  }

  private loadDetail(): void {
    if (!this.logId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.log = null;
    this.vehicle = null;
    this.logService
      .getLog(this.logId)
      .pipe(
        switchMap((log) =>
          this.vehicleService
            .getVehicle(log.vehicleId)
            .pipe(map((vehicle) => ({ log, vehicle }))),
        ),
      )
      .subscribe({
        next: ({ log, vehicle }) => {
          this.log = log;
          this.vehicleId = log.vehicleId;
          this.vehicle = vehicle;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading maintenance log detail:', error);
          this.log = null;
          this.vehicle = null;
          this.isLoading = false;
        },
      });
  }

  get sortedJobs(): Job[] {
    if (!this.log) return [];
    return [...this.log.jobs].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  get totalCost(): number {
    return this.sortedJobs.reduce(
      (total, job) => total + this.getJobTotal(job),
      0,
    );
  }

  getJobItemsTotal(job: Job): number {
    return job.items.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    );
  }

  getJobTotal(job: Job): number {
    return (job.cost || 0) + this.getJobItemsTotal(job);
  }

  getTypeClass(type: MaintenanceType): string {
    return `label-${type.toLowerCase()}`;
  }

  getTypeLabel(type: MaintenanceType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getJobIcon(job: Job): any {
    if (!job.icon) return Disc3Icon;
    const iconMap: Record<string, any> = {
      droplet: DropletIcon,
      droplets: DropletIcon,
      filter: FilterIcon,
      thermometer: ThermometerIcon,
      'flask-round': DropletIcon,
      'spray-can': WindIcon,
      'disc-3': Disc3Icon,
      'circle-dot': CircleIcon,
      wrench: WrenchIcon,
      'grip-vertical': WrenchIcon,
      'refresh-cw': CircleIcon,
      circle: CircleIcon,
      'move-horizontal': ScaleIcon,
      scale: ScaleIcon,
      gauge: GaugeIcon,
      zap: ZapIcon,
      wind: WindIcon,
      clock: ClockIcon,
      settings: SettingsIcon,
      'scan-line': SettingsIcon,
      battery: BatteryIcon,
      bolt: BoltIcon,
      power: PowerIcon,
      lightbulb: LightbulbIcon,
      'zap-off': ZapIcon,
      'arrow-down-up': WrenchIcon,
      'arrow-up-down': WrenchIcon,
      link: LinkIcon,
      'link-2': LinkIcon,
      cog: SettingsIcon,
      'volume-2': WrenchIcon,
      flame: FlameIcon,
      pipe: WrenchIcon,
      paintbrush: WrenchIcon,
      hammer: HammerIcon,
      square: WrenchIcon,
      'cloud-rain': CloudRainIcon,
      snowflake: SnowflakeIcon,
      fan: FanIcon,
      'clipboard-check': SettingsIcon,
      waves: WavesIcon,
      sparkles: SparklesIcon,
      truck: TruckIcon,
    };
    return iconMap[job.icon] || Disc3Icon;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const locale = this.translate.currentLang?.() === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  editLog(): void {
    if (!this.logId) return;
    void this.router.navigate(['/log', this.logId, 'edit']);
  }

  goBack(): void {
    if (this.vehicleId) {
      void this.router.navigate(['/vehicles', this.vehicleId]);
      return;
    }
    void this.router.navigate(['/tabs/vehicles']);
  }
}
