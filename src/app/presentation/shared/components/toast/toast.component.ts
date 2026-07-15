import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit, OnDestroy {
  /** The message text displayed in the toast. */
  @Input() message = '';

  /** The type of toast message. Defaults to "info" (Requirement 12.4). */
  @Input() type: ToastType = 'info';

  /**
   * Duration in milliseconds before the toast auto-dismisses.
   * Set to 0 or negative to disable auto-dismiss (manual close only).
   */
  @Input() duration = 3000;

  /**
   * Controls whether the toast is visible.
   * Set to false to hide the toast.
   */
  @Input() isVisible = true;

  /**
   * Emitted when the toast is dismissed (either by user click or auto-dismiss).
   */
  @Output() dismissed = new EventEmitter<void>();

  private dismissTimeout?: number;

  ngOnInit(): void {
    if (this.duration > 0 && this.isVisible) {
      this.dismissTimeout = window.setTimeout(() => {
        this.dismiss();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
  }

  dismiss(): void {
    this.isVisible = false;
    this.dismissed.emit();
  }
}
