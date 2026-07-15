/**
 * Abstract port for authentication.
 * Presentation components and guards depend on this abstraction.
 * Implemented by: HttpAuthService (data layer)
 */

import { Observable } from 'rxjs';
import {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  UserType,
} from '../models/user.model';

export abstract class AuthService {
  /** Emits the currently authenticated user, or null when not authenticated. */
  abstract user$: Observable<User | null>;

  abstract login(credentials: LoginCredentials): Observable<AuthTokens>;
  abstract register(data: RegisterData): Observable<AuthTokens>;
  abstract refreshToken(): Observable<AuthTokens>;
  abstract logout(): void;
  abstract isAuthenticated(): boolean;
  abstract getUserType(): UserType | null;
  /** Synchronously returns the current in-memory access token, or null if absent. */
  abstract getAccessToken(): string | null;
  /**
   * Update the user's preferred language.
   * Requirement 13.5: update preferred language and sync with backend
   */
  abstract updatePreferredLanguage(language: string): Observable<void>;
}
