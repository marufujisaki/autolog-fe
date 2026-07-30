/**
 * Centralized application dependency injection configuration.
 * Aggregates all service providers for the Autolog application.
 *
 * This configuration follows Requirement 3.6 (DI/configuration requirements):
 * - Binds abstract service ports to their HTTP implementations
 * - Configures the JWT interceptor for automatic token management (Requirement 2.3)
 * - Aggregates translation services configured in main.ts
 * - Centralizes all application providers for maintainability
 */

import { ApplicationConfig } from '@angular/core';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';

import { routes } from './app.routes';

// Abstract service ports (from core/ports)
import { AuthService } from './core/ports/auth.port';
import { VehicleService } from './core/ports/vehicle.port';
import { MaintenanceLogService } from './core/ports/maintenance-log.port';
import { PhotoService } from './core/ports/photo.port';
import { ShareService } from './core/ports/share.port';
import { WorkshopService } from './core/ports/workshop.port';
import { SecureStorageService } from './core/ports/secure-storage.port';
import { VehicleCatalogService } from './core/ports/vehicle-catalog.port';

// HTTP service implementations (from data/http)
import { HttpAuthService } from './data/http/http-auth.service';
import { HttpVehicleService } from './data/http/http-vehicle.service';
import { HttpMaintenanceLogService } from './data/http/http-maintenance-log.service';
import { HttpPhotoService } from './data/http/http-photo.service';
import { HttpShareService } from './data/http/http-share.service';
import { HttpWorkshopService } from './data/http/http-workshop.service';
import { HttpVehicleCatalogService } from './data/http/http-vehicle-catalog.service';

// Storage implementations (from data/storage)
import { CapacitorStorageService } from './data/storage/capacitor-storage.service';

// HTTP interceptors
import { jwtInterceptor } from './presentation/interceptors/jwt.interceptor';

/**
 * Returns the complete providers array for the Autolog application.
 * Configures:
 * - Routing with lazy loading and preloading strategy
 * - HTTP client with JWT interceptor
 * - Ionic Angular integration
 * - Dependency injection bindings for all services
 * - Translation services
 *
 * Binds abstract ports to implementations per Requirement 11.2:
 * - AuthService → HttpAuthService
 * - VehicleService → HttpVehicleService
 * - MaintenanceLogService → HttpMaintenanceLogService
 * - PhotoService → HttpPhotoService
 * - ShareService → HttpShareService
 * - SecureStorageService → CapacitorStorageService
 */
export function getAppProviders(): ApplicationConfig['providers'] {
  return [
    // Ionic and routing
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // HTTP client with JWT interceptor (Requirement 2.3)
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // Translation services
    provideTranslateService(),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),

    // Service port bindings - Authentication (Requirement 11.2)
    { provide: AuthService, useClass: HttpAuthService },

    // Service port bindings - Vehicle management (Requirement 11.2)
    { provide: VehicleService, useClass: HttpVehicleService },

    // Service port bindings - Maintenance logs (Requirement 11.2)
    { provide: MaintenanceLogService, useClass: HttpMaintenanceLogService },

    // Service port bindings - Photos (Requirement 11.2)
    { provide: PhotoService, useClass: HttpPhotoService },

    // Service port bindings - Vehicle sharing (Requirement 11.2)
    { provide: ShareService, useClass: HttpShareService },

    // Service port bindings - Workshop management (Requirement 11.2, 9.5)
    { provide: WorkshopService, useClass: HttpWorkshopService },

    // Service port bindings - Secure storage (Requirement 11.2)
    { provide: SecureStorageService, useClass: CapacitorStorageService },

    // Service port bindings - Vehicle catalog (autocomplete)
    { provide: VehicleCatalogService, useClass: HttpVehicleCatalogService },
  ];
}
