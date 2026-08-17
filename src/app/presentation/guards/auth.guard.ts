/**
 * Functional route guard that protects authenticated routes
 * (Requirement 3.6: unauthenticated access must be denied).
 * Redirects unauthenticated users (no session, or one that's expired and
 * couldn't be silently refreshed) straight to /login.
 *
 * Uses hasValidSession() rather than the synchronous isAuthenticated(),
 * so a deep-link/reload straight into a protected route awaits session
 * restoration (and attempts a silent refresh if the access token has
 * expired) instead of racing it and bouncing out spuriously.
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../core/ports/auth.port';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authenticated = await authService.hasValidSession();
  return authenticated ? true : router.createUrlTree(['/login']);
};
