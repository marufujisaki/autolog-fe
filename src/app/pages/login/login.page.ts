import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/ports/auth.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { GoogleSigninButtonComponent } from '../../presentation/shared/components/google-signin-button/google-signin-button.component';

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
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    ButtonComponent,
    InputComponent,
    GoogleSigninButtonComponent,
    TranslatePipe,
  ],
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Set by AuthService.logout('expired') (via jwt.interceptor.ts, when a
    // refresh attempt fails) redirecting here — a distinct notice from a
    // failed login attempt below, shown once then stripped from the URL so
    // a page refresh doesn't keep re-showing it.
    if (this.route.snapshot.queryParamMap.get('sessionExpired') === 'true') {
      this.errorMessage.set('auth.sessionExpired');
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigate(['/tabs/vehicles']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Backend distinguishes a Google-only account (never set a real
        // password) from a genuine wrong-password attempt via this stable,
        // untranslated `errorCode` — see ErrorResponse.ofCode() /
        // GoogleOnlyAccountException on the backend.
        this.errorMessage.set(
          err?.error?.errorCode === 'GOOGLE_ONLY_ACCOUNT'
            ? 'auth.googleOnlyAccountError'
            : 'auth.loginError',
        );
      },
    });
  }

  navigateToSignUp(): void {
    // The welcome/role-selection flow lives at the root path ('/', not
    // '/welcome/...' — see app.routes.ts/welcome.routes.ts), so the person
    // picks OWNER/CLIENT/MECHANIC before landing on the sign-up form.
    // welcomeGuard allows this in-app navigation through even on an
    // already-onboarded device (it only forces the skip-to-login/tabs
    // redirect on the app's actual cold launch).
    void this.router.navigate(['/']);
  }

  navigateToForgotPassword(): void {
    void this.router.navigate(['/forgot-password']);
  }

  onGoogleSuccess(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }

  get emailControl(): FormControl<string> {
    return this.loginForm.get('email') as FormControl<string>;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.get('password') as FormControl<string>;
  }
}
