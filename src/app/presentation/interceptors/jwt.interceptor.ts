/**
 * Functional HTTP interceptor that attaches the JWT access token to outgoing
 * requests targeting the app's own API, and transparently refreshes the
 * token and retries the request when a 401 response is received
 * (Requirement 2.3: refresh token rotation on access token expiry).
 */

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/ports/auth.port';

/** Requests to these auth endpoints must never trigger a refresh-and-retry cycle. */
const REFRESH_EXCLUDED_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
];

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiUrl);
}

function isRefreshExcluded(url: string): boolean {
  return REFRESH_EXCLUDED_PATHS.some((path) => url.includes(path));
}

function withAuthHeader(
  request: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const jwtInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (!isApiRequest(request.url)) {
    return next(request);
  }

  const accessToken = authService.getAccessToken();
  const authorizedRequest = accessToken
    ? withAuthHeader(request, accessToken)
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      const isUnauthorized =
        error instanceof HttpErrorResponse && error.status === 401;
      const canAttemptRefresh =
        isUnauthorized && !!accessToken && !isRefreshExcluded(request.url);

      if (!canAttemptRefresh) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((tokens) =>
          next(withAuthHeader(request, tokens.accessToken)),
        ),
        catchError((refreshError: unknown) => {
          authService.logout('expired');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
