import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Visual style variants supported by the Design System card.
 * Defaults to "elevated" per Requirement 12.4.
 */
export type CardVariant = 'elevated' | 'outlined';

/**
 * Design System card component.
 *
 * Renders a card container styled exclusively with SCSS design tokens
 * (see `presentation/shared/styles/_tokens.scss`). No third-party UI library
 * (e.g. Ionic's `ion-card`) is used for visual rendering, per Requirements
 * 12.3 and 12.5.
 *
 * Consumers project their own content via `<ng-content>`.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  /** Visual variant of the card. Defaults to "elevated" (Requirement 12.4). */
  @Input() variant: CardVariant = 'elevated';

  /** Optional padding applied to the card content. Defaults to true. */
  @Input() padded = true;
}
