import { Routes } from '@angular/router';
import { VehicleDetailPage } from './vehicle-detail/vehicle-detail.page';

/**
 * Routes for the vehicles feature.
 * Requirement 11.1: Lazy-loaded routes with guards (inherited from parent)
 */
export const vehiclesRoutes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/vehicles',
    pathMatch: 'full',
  },
  {
    path: ':vehicleId/logs/create',
    loadComponent: () =>
      import('../new-log/new-log.page').then((m) => m.NewLogPage),
  },
  {
    path: ':id',
    component: VehicleDetailPage,
  },
];
