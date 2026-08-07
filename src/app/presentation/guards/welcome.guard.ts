/**
 * Functional route guard for the Welcome page (path '').
 *
 * Shows Welcome only on a device's first-ever visit (before it has ever
 * completed a login/register). Once a device is onboarded, it never sees
 * Welcome again: it lands directly in the authenticated area if a valid (or
 * silently refreshable) session exists, Instagram/Facebook-style, or on
 * Login otherwise.
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../core/ports/auth.port';
import { DeviceService } from '../../core/services/device.service';

export const welcomeGuard: CanActivateFn = async () => {
  const deviceService = inject(DeviceService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const onboarded = await deviceService.hasOnboarded();
  if (!onboarded) {
    return true;
  }

  const authenticated = await authService.hasValidSession();
  return authenticated ? router.createUrlTree(['/tabs']) : router.createUrlTree(['/login']);
};
