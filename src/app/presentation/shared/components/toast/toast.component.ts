import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Toast message type variants supported by the Design System toast.
 * Defaults to "info" per Requirement 12.4.
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Design System toast component.
 *
 * Renders a dismissible notification message, styled exclusively with SCSS
 * design tokens (see `presentation/shared/styles/_tokens.scss`). No third-party
 * UI library (e.g. Ionic's `ion-toast`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Typically positioned at the top or bottom of the screen and auto-dismisses
 * after a configurable delay.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  /** The message text displayed in the toast. */
  readonly message = input('');

  /** The type of toast message. Defaults to "info" (Requirement 12.4). */
  readonly type = input<ToastType>('info');

  /**
   * Duration in milliseconds before the toast auto-dismisses.
   * Set to 0 or negative to disable auto-dismiss (manual close only).
   */
  readonly duration = input(3000);

  /**
   * Controls whether the toast is visible.
   * Set to false to hide the toast.
   */
  readonly isVisible = input(true);

  /** `dismiss()` also hides the toast internally — `input()` is read-only, so that writes here. */
  private readonly dismissedByUser = signal(false);
  readonly visible = computed(() => this.isVisible() && !this.dismissedByUser());

  /**
   * Emitted when the toast is dismissed (either by user click or auto-dismiss).
   */
  readonly dismissed = output<void>();

  private dismissTimeout?: number;

  ngOnInit(): void {
    if (this.duration() > 0 && this.isVisible()) {
      this.dismissTimeout = window.setTimeout(() => {
        this.dismiss();
      }, this.duration());
    }
  }

  ngOnDestroy(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
  }

  dismiss(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = undefined;
    }
    this.dismissedByUser.set(true);
    this.dismissed.emit();
  }
}
