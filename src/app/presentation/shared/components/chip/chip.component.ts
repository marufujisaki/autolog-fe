import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslatePipe],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
})
export class ChipComponent {
  /** Visual variant of the chip. Defaults to "default" (Requirement 12.4). */
  readonly variant = input<ChipVariant>('default');

  /** Disables the chip and applies the disabled visual state. */
  readonly disabled = input(false);

  /**
   * Optional close button that emits when clicked. Used for dismissible chips
   * (e.g., applied tags or filters).
   */
  readonly removable = input(false);

  /**
   * Emitted when the chip's remove button is clicked (if removable is true).
   */
  readonly removed = output<void>();

  onRemove(event: Event): void {
    if (!this.removable()) {
      return;
    }
    event.stopPropagation();
    // TODO: The 'emit' function requires a mandatory void argument
    this.removed.emit();
  }
}
