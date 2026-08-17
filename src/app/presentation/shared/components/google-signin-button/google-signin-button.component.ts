import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/ports/auth.port';

/**
 * "Continue with Google" divider + button, shared by the Login and Sign Up
 * pages — it's the exact same action from either screen (see
 * AuthUseCase.loginWithGoogle on the backend: it transparently logs in,
 * links, or registers depending on what already exists for the account).
 *
 * Owns the sign-in flow itself (calls `AuthService.loginWithGoogle()` on
 * click) and its own loading state; the host page only needs to react to
 * the outcome.
 */
@Component({
  selector: 'app-google-signin-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './google-signin-button.component.html',
  styleUrls: ['./google-signin-button.component.scss'],
})
export class GoogleSigninButtonComponent {
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);

  /** Emitted once tokens have been issued and applied — the host page should navigate onward. */
  readonly success = output<void>();
  /** Emitted with a translation key on failure (including a user-cancelled sign-in). */
  readonly signInError = output<string>();

  onClick(): void {
    if (this.isLoading()) {
      return;
    }
    this.isLoading.set(true);

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.emit();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.signInError.emit(this.resolveErrorKey(error));
      },
    });
  }

  private resolveErrorKey(error: unknown): string {
    return this.isUserCancelled(error)
      ? 'auth.googleSignInCancelled'
      : 'auth.googleSignInError';
  }

  /** The native/web sign-in sheet being dismissed by the user isn't a real error worth alarming them about. */
  private isUserCancelled(error: unknown): boolean {
    const message = (error as { message?: string } | null)?.message?.toLowerCase() ?? '';
    return message.includes('cancel') || message.includes('popup_closed');
  }
}
