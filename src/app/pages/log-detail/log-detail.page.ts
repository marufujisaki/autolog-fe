import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

  /** Idle (no fetch) until ngOnInit/ionViewWillEnter set it. */
  private readonly logIdSignal = signal('');
  private readonly logResource = this.logService.getLogResource(this.logIdSignal);

  /** Set once the log resolves and its vehicleId is known; idle (no fetch) until then. */
  private readonly vehicleIdSignal = signal('');
  private readonly vehicleResource = this.vehicleService.getVehicleResource(
    this.vehicleIdSignal,
  );

  constructor() {
    effect(() => {
      const log = this.logResource.value();
      if (log) {
        this.log = log;
        this.vehicleId = log.vehicleId;
        this.vehicleIdSignal.set(log.vehicleId);
      }
      if (this.logResource.error()) {
        console.error(
          'Error loading maintenance log detail:',
          this.logResource.error(),
        );
        this.log = null;
        this.vehicle = null;
      }
    });

    effect(() => {
      const vehicle = this.vehicleResource.value();
      if (vehicle) {
        this.vehicle = vehicle;
      }
      this.isLoading =
        this.logResource.isLoading() || this.vehicleResource.isLoading();
    });
  }

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('logId') || '';
    this.logIdSignal.set(this.logId);
  }

  /**
   * Ionic may reuse this page when returning from the edit route, so ngOnInit
   * is not guaranteed to run again. Reload on every subsequent page entry to
   * show the persisted log instead of the cached pre-edit state.
   */
  ionViewWillEnter(): void {
    if (this.hasEnteredDetail) {
      const nextLogId = this.route.snapshot.paramMap.get('logId') || this.logId;
      this.logId = nextLogId;
      if (this.logIdSignal() === nextLogId) {
        // Same id — a signal .set() with an unchanged value wouldn't
        // reactively refetch, so reload explicitly to pick up server edits.
        this.logResource.reload();
      } else {
        this.logIdSignal.set(nextLogId);
      }
    }
    this.hasEnteredDetail = true;
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
