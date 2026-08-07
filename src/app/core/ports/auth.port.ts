/**
 * Abstract port for authentication.
 * Presentation components and guards depend on this abstraction.
 * Implemented by: HttpAuthService (data layer)
 */

import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  User,
  UserType,
} from '../models/user.model';

export abstract class AuthService {
  /**
   * The currently authenticated user, or null when not authenticated.
   * Synchronous signal read — no subscription needed. Populated from JWT
   * claims immediately on login/session-restore, then kept in sync with the
   * full stored profile once `profile` resolves (see below).
   */
  abstract user: Signal<User | null>;

  /**
   * Live resource wrapping GET /me — reactively fetches once a session
   * exists (idle/no request while unauthenticated) and re-fetches on
   * `.reload()`. Exposes `.value()`/`.isLoading()`/`.error()`. Prefer `user`
   * above for "who is logged in right now" reads; use this when a page
   * specifically needs the profile fetch's own loading/error state.
   */
  abstract readonly profile: HttpResourceRef<User | undefined>;

  abstract login(credentials: LoginCredentials): Observable<AuthTokens>;
  abstract register(data: RegisterData): Observable<AuthTokens>;
  abstract refreshToken(): Observable<AuthTokens>;
  abstract logout(): void;
  abstract isAuthenticated(): boolean;
  /**
   * Resolves whether the app currently has (or can silently obtain via
   * refresh) a valid session — used at app boot to decide whether to land
   * straight in the authenticated area instead of showing Login/Welcome.
   */
  abstract hasValidSession(): Promise<boolean>;
  abstract getUserType(): UserType | null;
  /** Synchronously returns the current in-memory access token, or null if absent. */
  abstract getAccessToken(): string | null;
  /**
   * Update the user's preferred language.
   * Requirement 13.5: update preferred language and sync with backend
   */
  abstract updatePreferredLanguage(language: string): Observable<void>;

  /** Update the user's sharing preference (USUARIO only) */
  abstract updateAllowSharing(allowSharing: boolean): Observable<void>;

  /** Updates the authenticated user's editable profile fields. */
  abstract updateProfile(data: UpdateProfileData): Observable<User>;
}
