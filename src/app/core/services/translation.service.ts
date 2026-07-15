import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service to manage application translations and language preferences
 * Handles language initialization, switching, and persistence
 * Validates: Requirements 13.1, 13.3, 13.5
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly DEFAULT_LANGUAGE = 'es'; // Default language: Spanish
  private readonly SUPPORTED_LANGUAGES = ['es', 'en'];
  private readonly STORAGE_KEY = 'autolog_language';

  private translateService = inject(TranslateService);

  constructor() {
    this.initializeTranslations();
  }

  /**
   * Initialize translations on app startup
   * - Add supported languages
   * - Detect device language or load from storage
   * - Use Spanish as default language
   *
   * Requirement 13.3: Detect device language on first load
   * If supported (es or en), use it; otherwise default to Spanish
   */
  private initializeTranslations(): void {
    // Add supported languages to the TranslateService
    this.translateService.addLangs(this.SUPPORTED_LANGUAGES);

    // Try to load previously selected language from storage (Requirement 13.5)
    const storedLanguage = this.getStoredLanguage();
    if (storedLanguage && this.SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      this.setLanguage(storedLanguage);
      return;
    }

    // Detect device language and set if supported, otherwise use default (Spanish)
    const deviceLanguage = this.detectDeviceLanguage();
    if (deviceLanguage && this.SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      this.setLanguage(deviceLanguage);
    } else {
      // Default to Spanish if device language is not supported
      this.setLanguage(this.DEFAULT_LANGUAGE);
    }
  }

  /**
   * Detect the device's language from browser/navigator
   * Returns language code (e.g., 'es', 'en') or null if not detected
   * Requirement 13.3: Device language detection
   */
  private detectDeviceLanguage(): string | null {
    if (typeof window !== 'undefined' && navigator) {
      const browserLanguage =
        navigator.language || (navigator as any).userLanguage;
      if (browserLanguage) {
        // Extract language code (e.g., 'es' from 'es-ES')
        const languageCode = browserLanguage.split('-')[0];
        return languageCode;
      }
    }
    return null;
  }

  /**
   * Get the previously stored language preference from local storage
   */
  private getStoredLanguage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  /**
   * Set the current language and persist to storage
   * @param language - Language code to set (e.g., 'es', 'en')
   * Requirement 13.5: Language change persistence
   */
  setLanguage(language: string): void {
    if (this.SUPPORTED_LANGUAGES.includes(language)) {
      this.translateService.use(language);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, language);
      }
    }
  }

  /**
   * Get the current active language
   */
  getCurrentLanguage(): string {
    return this.translateService.currentLang() || this.DEFAULT_LANGUAGE;
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  /**
   * Get the default language
   */
  getDefaultLanguage(): string {
    return this.DEFAULT_LANGUAGE;
  }

  /**
   * Instant translation method (synchronous) - use when translation is already loaded
   * @param key - Translation key (e.g., 'auth.login')
   * @param params - Optional parameters for interpolation
   */
  instant(key: string, params?: any): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Get observable for translation (asynchronous) - use in templates with async pipe
   */
  get$(key: string, params?: any) {
    return this.translateService.get(key, params);
  }
}
