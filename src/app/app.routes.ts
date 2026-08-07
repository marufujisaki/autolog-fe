import { Routes } from '@angular/router';
import { authGuard } from './presentation/guards/auth.guard';
import { roleGuard } from './presentation/guards/role.guard';
import { welcomeGuard } from './presentation/guards/welcome.guard';
import { UserType } from './core/models/user.model';

/**
 * Root application routes with lazy loading and guards.
 * Implements Requirement 11.1: App routes with lazy loading and guards.
 * Implements Requirement 3.6: Authentication and authorization checks.
 *
 * Route Structure:
 * - Public routes (welcome, login, sign-up) - no guards
 * - Authenticated routes (tabs, vehicles, profile) - authGuard
 * - Role-restricted routes (workshop) - authGuard + roleGuard(MECANICO)
 *
 * All routes use lazy loading to optimize bundle size and initial load time.
 * The router uses Ionic's RouteReuseStrategy (configured in app.config.ts)
 * and IonRouterOutlet (used in app.component template) for native navigation integration.
 */
export const routes: Routes = [
  // Public routes - no authentication required
  {
    path: '',
    loadChildren: () =>
      import('./pages/welcome/welcome.routes').then((m) => m.routes),
    canActivate: [welcomeGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    path: 'forgot-password/reset',
    loadComponent: () =>
      import('./pages/forgot-password/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
  },

  // Authenticated routes - authGuard required
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard],
  },
  {
    path: 'vehicles',
    loadChildren: () =>
      import('./pages/vehicles/vehicles.routes').then((m) => m.vehiclesRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services.page').then((m) => m.ServicesPage),
    canActivate: [authGuard],
  },
  {
    path: 'new-log',
    loadComponent: () =>
      import('./pages/new-log/new-log.page').then((m) => m.NewLogPage),
    canActivate: [authGuard],
  },
  {
    path: 'log/:logId/edit',
    loadComponent: () =>
      import('./pages/new-log/new-log.page').then((m) => m.NewLogPage),
    canActivate: [authGuard],
  },
  {
    path: 'log/:logId',
    loadComponent: () =>
      import('./pages/log-detail/log-detail.page').then((m) => m.LogDetailPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
    canActivate: [authGuard],
  },

  // Role-restricted routes
  // Workshop page is only accessible to MECANICO users (Requirement 3.6, 9.5)
  {
    path: 'workshop',
    loadComponent: () =>
      import('./pages/workshop/workshop.page').then((m) => m.WorkshopPage),
    canActivate: [authGuard, roleGuard([UserType.MECANICO])],
  },
  // Scan-to-link page: only MECANICO users can claim a shared vehicle.
  {
    path: 'scan-vehicle',
    loadComponent: () =>
      import('./pages/scan-vehicle/scan-vehicle.page').then((m) => m.ScanVehiclePage),
    canActivate: [authGuard, roleGuard([UserType.MECANICO])],
  },

  // Catch-all redirect to welcome page
  {
    path: '**',
    redirectTo: '',
  },
];
