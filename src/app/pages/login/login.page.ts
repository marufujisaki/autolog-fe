import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/ports/auth.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';

/**
 * LoginPage — User authentication page (Figma: "Login" frame).
 * Requirement: 2.1 (login with email/password and JWT token handling)
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
  ],
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(['/tabs/tab1']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message || 'Invalid email or password';
      },
    });
  }

  navigateToSignUp(): void {
    void this.router.navigate(['/sign-up']);
  }

  navigateToForgotPassword(): void {
    void this.router.navigate(['/forgot-password']);
  }

  get emailControl(): FormControl<string> {
    return this.loginForm.get('email') as FormControl<string>;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.get('password') as FormControl<string>;
  }
}
