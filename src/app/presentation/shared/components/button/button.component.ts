import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Visual style variants supported by the Design System button.
 * Defaults to "primary" per Requirement 12.4.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon-button';

/**
 * Native button `type` attribute values supported by the component.
 */
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Design System button component.
 *
 * Renders a native `<button>` element styled exclusively with SCSS design
 * tokens (see `presentation/shared/styles/_tokens.scss`). No third-party UI
 * library (e.g. Ionic's `ion-button`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Consumers project their own content (text and/or icon markup) via
 * `<ng-content>`, allowing this component to remain presentation-agnostic.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  /** Visual variant of the button. Defaults to "primary" (Requirement 12.4). */
  @Input() variant: ButtonVariant = 'primary';

  /** Disables the button and applies the disabled visual state. */
  @Input() disabled = false;

  /** Native `type` attribute of the underlying `<button>` element. */
  @Input() type: ButtonType = 'button';

  /** Stretches the button to fill the width of its container. */
  @Input() fullWidth = false;

  /**
   * Accessible label for the button. Required for the `icon-button` variant
   * when no visible text is projected, so assistive technologies can
   * announce the button's purpose.
   */
  @Input() ariaLabel?: string;

  /** Emits the native click event when the button is activated. */
  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (this.disabled) {
      return;
    }
    this.clicked.emit(event);
  }
}
