/**
 * Abstract port for secure key-value storage (used to persist auth tokens).
 * Implemented by: CapacitorStorageService (data layer)
 */

export abstract class SecureStorageService {
  abstract setItem(key: string, value: string): Promise<void>;
  abstract getItem(key: string): Promise<string | null>;
  abstract removeItem(key: string): Promise<void>;
}
