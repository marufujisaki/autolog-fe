import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeToDismissDirective } from '../../directives/swipe-to-dismiss.directive';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Design System modal component.
 *
 * Renders a modal overlay with a dialog container, styled exclusively with
 * SCSS design tokens (see `presentation/shared/styles/_tokens.scss`). No
 * third-party UI library (e.g. Ionic's `ion-modal`) is used for visual
 * rendering, per Requirements 12.3 and 12.5.
 *
 * Consumers project their own content (header, body, footer) via `<ng-content>`.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, SwipeToDismissDirective, TranslatePipe],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  private static nextId = 0;

  /**
   * Controls whether the modal is visible. When true, the modal and backdrop
   * are rendered and interactive.
   */
  readonly isOpen = input(false);

  /** Optional title rendered in the modal header. */
  readonly title = input<string>();

  /** Visual layout variant used by the design system modal. */
  readonly variant = input<'default' | 'bottom-sheet' | 'confirmation-sheet'>('default');

  /** Shows the close button for layouts that normally omit it. */
  readonly showCloseButton = input(false);

  /** Unique ID for linking aria-labelledby to the title element. */
  readonly modalTitleId = `app-modal-title-${ModalComponent.nextId++}`;

  /**
   * Emitted when the user requests to close the modal (e.g., by clicking
   * the backdrop, close button, or cancel action).
   */
  readonly closed = output<void>();

  /** Sheet layouts can be dragged down from their header to close. */
  get isSheet(): boolean {
    const variant = this.variant();
    return (
      variant === 'bottom-sheet' || variant === 'confirmation-sheet'
    );
  }

  onBackdropClick(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.closed.emit();
  }

  onCloseClick(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.closed.emit();
  }
}
