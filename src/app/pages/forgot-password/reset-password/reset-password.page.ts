import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/ports/auth.port';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../../presentation/shared/components/input/input.component';
import { LucideAngularModule, ChevronLeftIcon } from 'lucide-angular';

/** Group-level validator: flags `passwordMismatch` when the two password fields differ. */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

/**
 * ResetPasswordPage — Step 2: Enter code and new password (Figma: "Forgot password - Step 2").
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
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
export class ResetPasswordPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  email = '';
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      code: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator as ValidatorFn] },
  );

  get passwordControl(): FormControl<string> {
    return this.form.get('password') as FormControl<string>;
  }

  get confirmPasswordControl(): FormControl<string> {
    return this.form.get('confirmPassword') as FormControl<string>;
  }

  get codeControl(): FormControl<string> {
    return this.form.get('code') as FormControl<string>;
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      // Can't reset without knowing which account — step 1 collects it.
      void this.router.navigate(['/forgot-password']);
    }
  }

  onSubmit(): void {
    if (!this.form.valid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, code } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword(this.email, code || '', password || '').subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || this.translate.instant('auth.resetPasswordError'),
        );
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/forgot-password']);
  }
}
