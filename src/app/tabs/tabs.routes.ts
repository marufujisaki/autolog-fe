import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

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
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'vehicles',
        pathMatch: 'full',
      },
    ],
  },
];
