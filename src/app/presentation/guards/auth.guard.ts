/**
 * Functional route guard that protects authenticated routes
 * (Requirement 3.6: unauthenticated access must be denied).
 * Redirects unauthenticated users to the welcome/login flow.
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../core/ports/auth.port';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
