import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { VehicleService } from '../../core/ports/vehicle.port';
import { Vehicle } from '../../core/models/vehicle.model';
import {
  LucideAngularModule,
  SearchIcon,
  ListFilterIcon,
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
  imports: [CommonModule, DatePipe, LucideAngularModule],
})
export class DashboardPage implements OnInit {
  private vehicleService = inject(VehicleService);
  private router = inject(Router);

  readonly SearchIcon = SearchIcon;
  readonly ListFilterIcon = ListFilterIcon;

  vehicles: Vehicle[] = [];
  isLoading = false;

  // Gradient colors for vehicle cards
  readonly cardColors = ['#3A86FF', '#FF006E', '#8338EC', '#FB5607', '#FFBE0B'];

  ngOnInit(): void {
    this.loadVehicles();
  }

  private loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getCardColor(index: number): string {
    return this.cardColors[index % this.cardColors.length];
  }

  viewVehicle(vehicleId: string): void {
    void this.router.navigate(['/vehicles', vehicleId]);
  }
}
