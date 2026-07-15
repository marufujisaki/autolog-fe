import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  CarFrontIcon,
  PlusIcon,
  UserIcon,
} from 'lucide-angular';

/**
 * TabsPage — Main shell with custom bottom navigation bar (Figma design).
 * Navigation: Vehicles | + (Add) | Profile
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

  navigateToVehicles(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }

  navigateToAdd(): void {
    void this.router.navigate(['/tabs/add-vehicle']);
  }

  navigateToProfile(): void {
    void this.router.navigate(['/tabs/profile']);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
