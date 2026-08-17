import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/ports/auth.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { LucideAngularModule, ChevronLeftIcon } from 'lucide-angular';

const RESEND_COOLDOWN_SECONDS = 30;

/**
 * ForgotPasswordPage — Step 1: Request password reset code (Figma: "Forgot password").
 */
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    LucideAngularModule,
    TranslatePipe,
  ],
})
export class ForgotPasswordPage implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly isLoading = signal(false);
  readonly errorKey = signal('');
  readonly resendCooldown = signal(0);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  get emailControl(): FormControl<string> {
    return this.form.get('email') as FormControl<string>;
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  onSubmit(): void {
    if (!this.form.valid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.sendCode(true);
  }

  resendCode(): void {
    if (!this.form.valid || this.isLoading() || this.resendCooldown() > 0) {
      return;
    }
    this.sendCode(false);
  }

  private sendCode(navigateAfter: boolean): void {
    const email = this.emailControl.value;
    this.isLoading.set(true);
    this.errorKey.set('');

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.startResendCooldown();
        if (navigateAfter) {
          void this.router.navigate(['/forgot-password/reset'], {
            queryParams: { email },
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorKey.set('auth.resetRequestError');
      },
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown.set(RESEND_COOLDOWN_SECONDS);
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
    this.cooldownTimer = setInterval(() => {
      const next = this.resendCooldown() - 1;
      this.resendCooldown.set(Math.max(next, 0));
      if (next <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }

  goBack(): void {
    void this.router.navigate(['/login']);
  }
}
