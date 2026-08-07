/**
 * User-related enums and interfaces (domain models for the frontend).
 */

/** Type of user account within the system. */
export enum UserType {
  CLIENTE = 'CLIENTE',
  USUARIO = 'USUARIO',
  MECANICO = 'MECANICO',
}

/** Level of a mechanic within their workshop. */
export enum MechanicLevel {
  AYUDANTE = 'AYUDANTE',
  SUPERVISOR = 'SUPERVISOR',
}

/** Authenticated user profile data. */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: UserType;
  mechanicLevel?: MechanicLevel;
  workshopId?: string;
  preferredLanguage: string | null;
  allowSharing: boolean;
}

/** Editable profile fields submitted from the profile screen. */
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: UserType;
}

/** Credentials submitted on login. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Tokens returned by the API after a successful login/register/refresh. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
}

/** Data submitted when registering a new account. */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  mechanicLevel?: MechanicLevel;
  workshopId?: string;
}
