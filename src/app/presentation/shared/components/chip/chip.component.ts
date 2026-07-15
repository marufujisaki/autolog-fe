import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Visual style variants supported by the Design System chip.
 * Defaults to "default" per Requirement 12.4.
 */
export type ChipVariant = 'default' | 'selected';

/**
 * Design System chip component.
 *
 * Renders a small, compact pill-shaped container styled exclusively with SCSS
 * design tokens (see `presentation/shared/styles/_tokens.scss`). No third-party
 * UI library (e.g. Ionic's `ion-chip`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Typically used to display tags, maintenance types, or selectable filters.
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class ChipComponent {
  /** Visual variant of the chip. Defaults to "default" (Requirement 12.4). */
  @Input() variant: ChipVariant = 'default';

  /** Disables the chip and applies the disabled visual state. */
  @Input() disabled = false;

  /**
   * Optional close button that emits when clicked. Used for dismissible chips
   * (e.g., applied tags or filters).
   */
  @Input() removable = false;

  /**
   * Emitted when the chip's remove button is clicked (if removable is true).
   */
  @Output() removed = new EventEmitter<void>();

  onRemove(event: Event): void {
    if (!this.removable) {
      return;
    }
    event.stopPropagation();
    this.removed.emit();
  }
}
