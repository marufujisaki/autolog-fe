import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { SecureStorageService } from '../ports/secure-storage.port';

const DEVICE_ID_KEY = 'autolog.deviceId';
const HAS_ONBOARDED_KEY = 'autolog.hasOnboarded';

/**
 * Tracks a per-installation device identity, used to (a) associate logins
 * with a device server-side and (b) decide whether the Welcome page should
 * be shown (only on a device's first-ever successful login/register).
 *
 * The device id is a random installation-scoped UUID, not a hardware
 * fingerprint — it is generated once and persisted via the same
 * SecureStorageService (Capacitor Preferences) already used for auth
 * tokens, so it naturally resets on uninstall/reinstall.
 */
@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly storage = inject(SecureStorageService);

  private deviceIdPromise: Promise<string> | null = null;

  getDeviceId(): Promise<string> {
    if (!this.deviceIdPromise) {
      this.deviceIdPromise = this.resolveDeviceId();
    }
    return this.deviceIdPromise;
  }

  async hasOnboarded(): Promise<boolean> {
    const value = await this.storage.getItem(HAS_ONBOARDED_KEY);
    return value === 'true';
  }

  async markOnboarded(): Promise<void> {
    await this.storage.setItem(HAS_ONBOARDED_KEY, 'true');
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }

  private async resolveDeviceId(): Promise<string> {
    const existing = await this.storage.getItem(DEVICE_ID_KEY);
    if (existing) {
      return existing;
    }
    const generated = crypto.randomUUID();
    await this.storage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  }
}
