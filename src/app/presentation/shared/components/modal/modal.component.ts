import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwipeToDismissDirective } from '../../directives/swipe-to-dismiss.directive';

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
  imports: [CommonModule, SwipeToDismissDirective],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  private static nextId = 0;

  /**
   * Controls whether the modal is visible. When true, the modal and backdrop
   * are rendered and interactive.
   */
  @Input() isOpen = false;

  /** Optional title rendered in the modal header. */
  @Input() title?: string;

  /** Visual layout variant used by the design system modal. */
  @Input() variant: 'default' | 'bottom-sheet' | 'confirmation-sheet' =
    'default';

  /** Shows the close button for layouts that normally omit it. */
  @Input() showCloseButton = false;

  /** Unique ID for linking aria-labelledby to the title element. */
  readonly modalTitleId = `app-modal-title-${ModalComponent.nextId++}`;

  /**
   * Emitted when the user requests to close the modal (e.g., by clicking
   * the backdrop, close button, or cancel action).
   */
  @Output() closed = new EventEmitter<void>();

  /** Sheet layouts can be dragged down from their header to close. */
  get isSheet(): boolean {
    return (
      this.variant === 'bottom-sheet' || this.variant === 'confirmation-sheet'
    );
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  onCloseClick(): void {
    this.closed.emit();
  }
}
