import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, LucideAngularModule],
})
export class TabsPage {
  private router = inject(Router);

  readonly CarFrontIcon = CarFrontIcon;
  readonly PlusIcon = PlusIcon;
  readonly UserIcon = UserIcon;
  readonly CarIcon = CarIcon;
  readonly WrenchIcon = WrenchIcon;

  fabMenuOpen = false;

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
    void this.router.navigate(['/tabs/add-vehicle']);
  }

  openNewLog(): void {
    this.fabMenuOpen = false;
    void this.router.navigate(['/tabs/new-log']);
  }

  navigateToProfile(): void {
    void this.router.navigate(['/tabs/profile']);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
