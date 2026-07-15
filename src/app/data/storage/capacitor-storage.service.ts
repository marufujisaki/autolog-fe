/**
 * Concrete implementation of SecureStorageService backed by
 * @capacitor/preferences. On native platforms Capacitor stores values in
 * platform-appropriate secure/persistent storage (Keychain on iOS,
 * EncryptedSharedPreferences-backed storage on Android); on the web it
 * falls back to localStorage automatically, which keeps a single
 * implementation working across web and native targets (Requirement 11.2).
 */

import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { SecureStorageService } from '../../core/ports/secure-storage.port';

@Injectable()
export class CapacitorStorageService extends SecureStorageService {
  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
