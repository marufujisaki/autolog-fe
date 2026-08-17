/**
 * Functional route guard for the Welcome page (path '').
 *
 * Shows Welcome only on a device's first-ever visit (before it has ever
 * completed a login/register). Once a device is onboarded, it never sees
 * Welcome again ON THE APP'S COLD LAUNCH: it lands directly in the
 * authenticated area if a valid (or silently refreshable) session exists,
 * Instagram/Facebook-style, or on Login otherwise.
 *
 * That skip is deliberately scoped to the cold launch only, not to Welcome
 * as a route in general — an in-app navigation back to '/' later (e.g. the
 * "Sign up" button on Login, for someone who wants to register a second
 * account on the same device) must be allowed through to the role picker
 * instead of being bounced straight back to Login/Tabs.
 *
 * `router.getCurrentNavigation()?.id === 1` is Angular Router's own
 * first-navigation marker: id 1 only for literally the first navigation
 * since this app instance's JS context started (a real app relaunch on
 * mobile, or a hard browser reload) — every later navigation, in-app or
 * not, gets id 2+. No custom "has the app launched" tracking needed.
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

  const isColdLaunch = router.getCurrentNavigation()?.id === 1;
  if (!isColdLaunch) {
    return true;
  }

  const authenticated = await authService.hasValidSession();
  return authenticated ? router.createUrlTree(['/tabs']) : router.createUrlTree(['/login']);
};
