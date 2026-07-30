import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { MaintenanceLog } from '../../core/models/maintenance-log.model';
import { MaintenanceType } from '../../core/models/job.model';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from 'lucide-angular';

/**
 * ServicesPage — Maintenance log list page (Figma: "Services" frame).
 * Shows all maintenance logs for a vehicle with type labels, descriptions, and dates.
 */
@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
})
export class ServicesPage implements OnInit {
  private logService = inject(MaintenanceLogService);
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly SearchIcon = SearchIcon;

  logs: MaintenanceLog[] = [];
  isLoading = false;

  // Mock data for display when no real data
  mockLogs = [
    {
      id: '1',
      title: 'Brake Pads Replacement\nOil Change',
      types: [MaintenanceType.REPLACEMENT, MaintenanceType.SERVICE],
      description: 'Changed pads and oil; checked brake fluid levels.',
      vehicle: 'Toyota Corolla 2019 - Company Car',
      date: 'Sept 17',
    },
    {
      id: '2',
      title: 'Radiator Cover Repair',
      types: [MaintenanceType.REPAIR, MaintenanceType.CONSUMABLE],
      description: 'Changed pads and oil; checked brake fluid levels.',
      vehicle: 'Toyota Corolla 2019',
      date: 'Sept 17',
    },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  private loadLogs(): void {
    this.isLoading = true;
    // In a real app, this would load logs for the current vehicle
    this.isLoading = false;
  }

  getTypeLabel(type: MaintenanceType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getTypeClass(type: MaintenanceType): string {
    return `label-${type.toLowerCase()}`;
  }

  goBack(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }

  viewLog(logId: string): void {
    void this.router.navigate(['/log', logId]);
  }
}
