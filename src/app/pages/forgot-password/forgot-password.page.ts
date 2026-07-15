import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { LucideAngularModule, ChevronLeftIcon } from 'lucide-angular';

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
  ],
})
export class ForgotPasswordPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = false;

  get emailControl(): FormControl<string> {
    return this.form.get('email') as FormControl<string>;
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    // Navigate to step 2 (in a real app, this would send the reset code first)
    void this.router.navigate(['/forgot-password/reset']);
  }

  goBack(): void {
    void this.router.navigate(['/login']);
  }
}
