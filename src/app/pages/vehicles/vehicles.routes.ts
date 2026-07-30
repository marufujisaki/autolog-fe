import { Routes } from '@angular/router';
import { VehiclesPage } from './vehicles.page';
import { VehicleDetailPage } from './vehicle-detail/vehicle-detail.page';

/**
 * Routes for the vehicles feature.
 * Requirement 11.1: Lazy-loaded routes with guards (inherited from parent)
 */
export const vehiclesRoutes: Routes = [
  {
    path: '',
    component: VehiclesPage,
  },
  {
    path: ':vehicleId/share',
    loadComponent: () =>
      import('../share-vehicle/share-vehicle.page').then(
        (m) => m.ShareVehiclePage,
      ),
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
