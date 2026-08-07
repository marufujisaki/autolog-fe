import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AddVehiclePage } from '../pages/add-vehicle/add-vehicle.page';
import { NewLogPage } from '../pages/new-log/new-log.page';
import { AuthService } from '../core/ports/auth.port';
import { UserType } from '../core/models/user.model';
import {
  LucideAngularModule,
  CarFrontIcon,
  PlusIcon,
  UserIcon,
  CarIcon,
  WrenchIcon,
} from 'lucide-angular';

/**
 * TabsPage — Main shell with custom bottom navigation bar (Figma design).
 * Navigation: Vehicles | + (Add Menu) | Profile
 */
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    LucideAngularModule,
    AddVehiclePage,
    NewLogPage,
  ],
})
export class TabsPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly CarFrontIcon = CarFrontIcon;
  readonly PlusIcon = PlusIcon;
  readonly UserIcon = UserIcon;
  readonly CarIcon = CarIcon;
  readonly WrenchIcon = WrenchIcon;

  fabMenuOpen = false;
  addVehicleModalOpen = false;
  newLogModalOpen = false;

  navigateToVehicles(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }

  toggleFabMenu(): void {
    this.fabMenuOpen = !this.fabMenuOpen;
  }

  closeFabMenu(): void {
    this.fabMenuOpen = false;
  }

  openAddVehicle(): void {
    this.fabMenuOpen = false;
    this.newLogModalOpen = false;

    // MECANICO users don't own vehicles to add — they link to one shared
    // with them by scanning its QR/link instead.
    if (this.authService.getUserType() === UserType.MECANICO) {
      void this.router.navigate(['/scan-vehicle']);
      return;
    }

    this.addVehicleModalOpen = true;
  }

  closeAddVehicle(): void {
    this.addVehicleModalOpen = false;
  }

  openNewLog(): void {
    this.fabMenuOpen = false;
    this.addVehicleModalOpen = false;
    this.newLogModalOpen = true;
  }

  closeNewLog(): void {
    this.newLogModalOpen = false;
  }

  navigateToProfile(): void {
    void this.router.navigate(['/tabs/profile']);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
