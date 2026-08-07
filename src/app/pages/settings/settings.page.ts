import { Component, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/ports/auth.port';
import { UserType } from '../../core/models/user.model';
import { TranslationService } from '../../core/services/translation.service';
import { SelectComponent } from '../../presentation/shared/components/select/select.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  LanguagesIcon,
  MonitorSmartphoneIcon,
  Share2Icon,
  SunMoonIcon,
} from 'lucide-angular';
import type { SelectOption } from '../../presentation/shared/components/select/select.component';

/**
 * SettingsPage — App preferences: language, vehicle sharing and the
 * placeholders for linked devices and theme.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    LucideAngularModule,
    SelectComponent,
    ToastComponent,
  ],
})
export class SettingsPage implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly LanguagesIcon = LanguagesIcon;
  readonly Share2Icon = Share2Icon;
  readonly MonitorSmartphoneIcon = MonitorSmartphoneIcon;
  readonly SunMoonIcon = SunMoonIcon;

  selectedLanguage = this.translationService.getCurrentLanguage();
  allowSharing = false;
  isSharingLoading = false;
  canManageSharing = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  readonly languageOptions: SelectOption[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (!user) return;
      this.allowSharing = user.allowSharing ?? false;
      this.canManageSharing = user.userType === UserType.USUARIO;
      this.selectedLanguage =
        user.preferredLanguage || this.translationService.getCurrentLanguage();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLanguageChange(language: string | number): void {
    const code = String(language);
    if (!code || code === this.selectedLanguage) return;

    const previous = this.selectedLanguage;
    this.selectedLanguage = code;
    this.translationService.setLanguage(code);

    this.authService
      .updatePreferredLanguage(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.showToast('profile.language_updated', 'success'),
        error: () => {
          this.selectedLanguage = previous;
          this.translationService.setLanguage(previous);
          this.showToast('profile.language_update_failed', 'error');
        },
      });
  }

  onSharingToggle(enabled: boolean): void {
    this.isSharingLoading = true;
    this.authService
      .updateAllowSharing(enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allowSharing = enabled;
          this.isSharingLoading = false;
        },
        error: () => {
          this.allowSharing = !enabled;
          this.isSharingLoading = false;
          this.showToast('settings.sharingError', 'error');
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/tabs/profile']);
  }

  private showToast(messageKey: string, type: 'success' | 'error'): void {
    this.toastMessage = messageKey;
    this.toastType = type;
    this.toastVisible = true;
  }
}
