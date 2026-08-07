/**
 * HTTP implementation of the AuthService port (Requirement 11.2, 11.4).
 *
 * Note on `user`: the backend's login/register/refresh endpoints
 * (AuthController) only return JWT tokens and the authenticated userType,
 * not a full user profile (see AuthResult on the backend). There is no
 * profile data in the JWT itself beyond a few claims (subject = userId,
 * userType, mechanicLevel, preferredLanguage), so `user` starts out
 * populated from those claims with placeholder values for fields not
 * present there (email, firstName, lastName, phone), and gets merged with
 * the authoritative stored profile as soon as the `profile` resource
 * (GET /api/auth/me) resolves.
 */

import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, Injector, Signal, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/ports/auth.port';
import { DeviceService } from '../../core/services/device.service';
import { SecureStorageService } from '../../core/ports/secure-storage.port';
import { TranslationService } from '../../core/services/translation.service';
import {
  AuthTokens,
  LoginCredentials,
  MechanicLevel,
  RegisterData,
  UpdateProfileData,
  User,
  UserType,
} from '../../core/models/user.model';

const ACCESS_TOKEN_KEY = 'autolog.accessToken';
const REFRESH_TOKEN_KEY = 'autolog.refreshToken';

interface AccessTokenClaims {
  userId: string;
  userType: UserType;
  mechanicLevel?: MechanicLevel;
  expiresAtSeconds?: number;
  preferredLanguage?: string;
}

@Injectable()
export class HttpAuthService extends AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(SecureStorageService);
  private readonly router = inject(Router);
  private readonly deviceService = inject(DeviceService);

  /**
   * Resolved lazily via Injector rather than a plain `inject()` field: eagerly
   * constructing TranslationService here would synchronously trigger its i18n
   * HTTP load, which passes through jwt.interceptor.ts, which injects
   * AuthService — landing back on this very instance mid-construction
   * (NG0200 circular dependency). Deferring resolution past the constructor
   * breaks the cycle in both boot orderings.
   */
  private readonly injector = inject(Injector);
  private get translationService(): TranslationService {
    return this.injector.get(TranslationService);
  }

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly userSignal = signal<User | null>(null);
  readonly user: Signal<User | null> = this.userSignal.asReadonly();

  /** In-memory cache mirroring storage, since isAuthenticated()/getAccessToken() must be synchronous. */
  private readonly cachedAccessTokenSignal = signal<string | null>(null);
  private readonly cachedUserTypeSignal = computed(
    () => this.userSignal()?.userType ?? null,
  );

  /**
   * Live GET /me resource — idle (no request) while unauthenticated, since
   * the request function only returns a URL once `cachedAccessTokenSignal`
   * is set. Fires automatically the moment a session is established
   * (login/register/restore), and again on `.reload()`. Declared AFTER
   * `cachedAccessTokenSignal` deliberately: class field initializers run in
   * declaration order, and this resource's request function reads that
   * signal at creation time — it must already exist on `this`.
   */
  readonly profile = httpResource<User>(() =>
    this.cachedAccessTokenSignal() ? `${this.baseUrl}/me` : undefined,
  );

  /** Memoized so every caller awaits the same in-flight restore instead of racing it. */
  private readonly sessionRestored: Promise<void>;

  constructor() {
    super();
    this.sessionRestored = this.restoreSession();

    // Keep `user` in sync with the authoritative stored profile once it
    // loads — a merge, not a replace, so JWT-derived fields already set by
    // setSessionState() aren't clobbered by a slower-resolving fetch.
    effect(() => {
      const profile = this.profile.value();
      if (!profile) {
        return;
      }
      this.userSignal.set(profile);
      if (profile.preferredLanguage) {
        this.translationService.setLanguage(profile.preferredLanguage);
      }
    });
  }

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return from(this.deviceService.getDeviceId()).pipe(
      switchMap((deviceId) =>
        this.http.post<AuthTokens>(`${this.baseUrl}/login`, {
          ...credentials,
          deviceId,
          platform: this.deviceService.getPlatform(),
        }),
      ),
      tap((tokens) => this.applyTokens(tokens)),
      tap(() => void this.deviceService.markOnboarded()),
    );
  }

  register(data: RegisterData): Observable<AuthTokens> {
    return from(this.deviceService.getDeviceId()).pipe(
      switchMap((deviceId) =>
        this.http.post<AuthTokens>(`${this.baseUrl}/register`, {
          ...data,
          deviceId,
          platform: this.deviceService.getPlatform(),
        }),
      ),
      tap((tokens) => this.applyTokens(tokens)),
      tap(() => void this.deviceService.markOnboarded()),
    );
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
    this.cachedAccessTokenSignal.set(null);
    this.userSignal.set(null);
    void this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.cachedAccessTokenSignal() !== null;
  }

  /**
   * Resolves to true if a valid session exists — either a still-fresh
   * cached access token, or one successfully renewed via the refresh
   * token. Deliberately does NOT treat a merely-present access token as
   * sufficient: it is never cleared just because it expired (only logout()
   * or a failed refresh does that), so on a typical cold start (reopened
   * after the 15 min access-token lifetime) it would almost always be
   * stale — checking presence alone would send the caller into the
   * authenticated area only to immediately bounce back out once the first
   * API call 401s.
   */
  async hasValidSession(): Promise<boolean> {
    await this.sessionRestored;

    const accessToken = this.cachedAccessTokenSignal();
    if (accessToken && !this.isExpired(accessToken)) {
      return true;
    }

    const refreshToken = await this.storage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }

    try {
      await firstValueFrom(this.refreshToken());
      return true;
    } catch {
      return false;
    }
  }

  getUserType(): UserType | null {
    return this.cachedUserTypeSignal();
  }

  getAccessToken(): string | null {
    return this.cachedAccessTokenSignal();
  }

  updatePreferredLanguage(language: string): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/language`, { language })
      .pipe(tap(() => this.patchCurrentUser({ preferredLanguage: language })));
  }

  updateAllowSharing(allowSharing: boolean): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/sharing`, { allowSharing })
      .pipe(tap(() => this.patchCurrentUser({ allowSharing })));
  }

  updateProfile(data: UpdateProfileData): Observable<User> {
    return this.http
      .put<User>(`${this.baseUrl}/profile`, data)
      .pipe(tap((user) => this.userSignal.set(user)));
  }

  /** Keeps the in-memory user in sync after a partial preference update. */
  private patchCurrentUser(changes: Partial<User>): void {
    const current = this.userSignal();
    if (current) {
      this.userSignal.set({ ...current, ...changes });
    }
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
    const claims = this.decodeAccessToken(accessToken);
    if (!claims) {
      this.cachedAccessTokenSignal.set(null);
      this.userSignal.set(null);
      return;
    }

    // Requirement: the backend's stored preference is authoritative across
    // devices/reinstalls — sync it in. If absent (user never set one),
    // leave TranslationService's own device-locale fallback in control.
    if (claims.preferredLanguage) {
      this.translationService.setLanguage(claims.preferredLanguage);
    }

    this.userSignal.set({
      id: claims.userId,
      email: '',
      firstName: '',
      lastName: '',
      userType: claims.userType,
      mechanicLevel: claims.mechanicLevel,
      preferredLanguage: claims.preferredLanguage ?? this.translationService.getCurrentLanguage(),
      allowSharing: false,
    });

    // Set last: the `profile` resource's request function reads this signal,
    // so it only starts fetching once `user` already has JWT-derived data to
    // merge into (avoids a moment where profile resolves before setSessionState
    // has published anything for it to merge with).
    this.cachedAccessTokenSignal.set(accessToken);
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
        exp?: number;
        preferredLanguage?: string;
      };
      return {
        userId: payload.sub,
        userType: payload.userType,
        mechanicLevel: payload.mechanicLevel,
        expiresAtSeconds: payload.exp,
        preferredLanguage: payload.preferredLanguage,
      };
    } catch {
      return null;
    }
  }

  /** True if the token's `exp` claim is missing, unparsable, or in the past. */
  private isExpired(token: string): boolean {
    const claims = this.decodeAccessToken(token);
    if (!claims?.expiresAtSeconds) {
      return true;
    }
    return Date.now() >= claims.expiresAtSeconds * 1000;
  }
}
