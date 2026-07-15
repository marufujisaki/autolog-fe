/**
 * Functional route guard factory that restricts a route to a specific set
 * of user types (Requirement 3.6: authenticated but unauthorized access
 * must be denied). Users without an allowed role are redirected to a safe
 * default route.
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../../core/ports/auth.port';
import { UserType } from '../../core/models/user.model';

export function roleGuard(allowedRoles: UserType[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userType = authService.getUserType();
    if (userType !== null && allowedRoles.includes(userType)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}
