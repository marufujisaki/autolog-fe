import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { roleGuard } from '../presentation/guards/role.guard';
import { UserType } from '../core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'vehicles',
        loadComponent: () =>
          import('../pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'add-vehicle',
        loadComponent: () =>
          import('../pages/add-vehicle/add-vehicle.page').then(
            (m) => m.AddVehiclePage,
          ),
      },
      // Scan-to-link fallback route (deep link / direct URL access) — only
      // MECHANIC users can claim a shared vehicle. Normal usage opens this
      // as an overlay from TabsPage.openAddVehicle instead.
      {
        path: 'scan-vehicle',
        loadComponent: () =>
          import('../pages/scan-vehicle/scan-vehicle.page').then(
            (m) => m.ScanVehiclePage,
          ),
        canActivate: [roleGuard([UserType.MECHANIC])],
      },
      {
        path: 'new-log',
        loadComponent: () =>
          import('../pages/new-log/new-log.page').then((m) => m.NewLogPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: 'vehicles',
        pathMatch: 'full',
      },
    ],
  },
];
