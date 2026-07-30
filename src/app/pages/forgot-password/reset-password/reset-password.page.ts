import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../../presentation/shared/components/input/input.component';
import { LucideAngularModule, ChevronLeftIcon } from 'lucide-angular';

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
export class ResetPasswordPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    code: ['', [Validators.required]],
  });

  get passwordControl(): FormControl<string> {
    return this.form.get('password') as FormControl<string>;
  }

  get confirmPasswordControl(): FormControl<string> {
    return this.form.get('confirmPassword') as FormControl<string>;
  }

  get codeControl(): FormControl<string> {
    return this.form.get('code') as FormControl<string>;
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    void this.router.navigate(['/login']);
  }

  goBack(): void {
    void this.router.navigate(['/forgot-password']);
  }
}
