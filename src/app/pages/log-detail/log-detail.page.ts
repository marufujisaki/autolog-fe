import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { MaintenanceLog } from '../../core/models/maintenance-log.model';
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
} from 'lucide-angular';

/**
 * LogDetailPage — Maintenance log detail view (Figma: "Detail 2" frame).
 * Shows vehicle info, mechanic, date, and all jobs with items and costs.
 */
@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.page.html',
  styleUrls: ['./log-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
})
export class LogDetailPage implements OnInit {
  private logService = inject(MaintenanceLogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
  isLoading = true;

  ngOnInit(): void {
    this.logId = this.route.snapshot.paramMap.get('logId') || '';
    this.vehicleId = this.route.snapshot.paramMap.get('vehicleId') || '';
    this.loadLog();
  }

  private loadLog(): void {
    this.isLoading = true;
    this.logService.getLog(this.logId).subscribe({
      next: (log) => {
        this.log = log;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get sortedJobs(): Job[] {
    if (!this.log) return [];
    return [...this.log.jobs].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  get totalCost(): number {
    return this.log?.totalCost || 0;
  }

  getTypeClass(type: MaintenanceType): string {
    return `label-${type.toLowerCase()}`;
  }

  getTypeLabel(type: MaintenanceType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  goBack(): void {
    void this.router.navigate(['/vehicles', this.vehicleId]);
  }
}
