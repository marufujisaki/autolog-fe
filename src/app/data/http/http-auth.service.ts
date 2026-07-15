/**
 * HTTP implementation of the AuthService port (Requirement 11.2, 11.4).
 *
 * Note on user$: the backend's login/register/refresh endpoints
 * (AuthController) only return JWT tokens and the authenticated userType,
 * not a full user profile (see AuthResult on the backend). There is no
 * "current user" REST endpoint yet, so the `user$` state exposed here is
 * derived from the access token's claims (subject = userId, userType,
 * mechanicLevel) rather than a dedicated profile fetch. Fields that are not
 * present as JWT claims (email, firstName, lastName, preferredLanguage) are
 * populated with reasonable defaults and should be replaced once a "get
 * current user" endpoint is introduced.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/ports/auth.port';
import { SecureStorageService } from '../../core/ports/secure-storage.port';
import {
  AuthTokens,
  LoginCredentials,
  MechanicLevel,
  RegisterData,
  User,
  UserType,
} from '../../core/models/user.model';

const ACCESS_TOKEN_KEY = 'autolog.accessToken';
const REFRESH_TOKEN_KEY = 'autolog.refreshToken';

interface AccessTokenClaims {
  userId: string;
  userType: UserType;
  mechanicLevel?: MechanicLevel;
}

@Injectable()
export class HttpAuthService extends AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(SecureStorageService);
  private readonly router = inject(Router);

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  /** In-memory cache mirroring storage, since isAuthenticated()/getUserType() must be synchronous. */
  private cachedAccessToken: string | null = null;
  private cachedUserType: UserType | null = null;

  constructor() {
    super();
    void this.restoreSession();
  }

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.baseUrl}/login`, credentials)
      .pipe(tap((tokens) => this.applyTokens(tokens)));
  }

  register(data: RegisterData): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.baseUrl}/register`, data)
      .pipe(tap((tokens) => this.applyTokens(tokens)));
  }

  refreshToken(): Observable<AuthTokens> {
    return from(this.storage.getItem(REFRESH_TOKEN_KEY)).pipe(
      switchMap((refreshToken) =>
        this.http.post<AuthTokens>(`${this.baseUrl}/refresh`, { refreshToken }),
      ),
      tap((tokens) => this.applyTokens(tokens)),
    );
  }

  logout(): void {
    // Fire-and-forget: invalidate the refresh token server-side without
    // blocking the synchronous logout contract required by the port.
    this.http
      .post<void>(`${this.baseUrl}/logout`, {})
      .subscribe({ error: () => undefined });

    void this.storage.removeItem(ACCESS_TOKEN_KEY);
    void this.storage.removeItem(REFRESH_TOKEN_KEY);
    this.cachedAccessToken = null;
    this.cachedUserType = null;
    this.userSubject.next(null);
    void this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.cachedAccessToken !== null;
  }

  getUserType(): UserType | null {
    return this.cachedUserType;
  }

  getAccessToken(): string | null {
    return this.cachedAccessToken;
  }

  updatePreferredLanguage(language: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/language`, { language });
  }

  updateAllowSharing(allowSharing: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/sharing`, { allowSharing });
  }

  private async restoreSession(): Promise<void> {
    const accessToken = await this.storage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      this.setSessionState(accessToken);
    }
  }

  private applyTokens(tokens: AuthTokens): void {
    void this.storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    void this.storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    this.setSessionState(tokens.accessToken);
  }

  private setSessionState(accessToken: string): void {
    this.cachedAccessToken = accessToken;
    const claims = this.decodeAccessToken(accessToken);
    if (!claims) {
      this.cachedUserType = null;
      this.userSubject.next(null);
      return;
    }

    this.cachedUserType = claims.userType;
    this.userSubject.next({
      id: claims.userId,
      email: '',
      firstName: '',
      lastName: '',
      userType: claims.userType,
      mechanicLevel: claims.mechanicLevel,
      preferredLanguage: 'es',
      allowSharing: false,
    });
  }

  /** Decodes the JWT payload (base64url) without verifying the signature. */
  private decodeAccessToken(token: string): AccessTokenClaims | null {
    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) {
        return null;
      }
      const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const payload = JSON.parse(json) as {
        sub: string;
        userType: UserType;
        mechanicLevel?: MechanicLevel;
      };
      return {
        userId: payload.sub,
        userType: payload.userType,
        mechanicLevel: payload.mechanicLevel,
      };
    } catch {
      return null;
    }
  }
}
