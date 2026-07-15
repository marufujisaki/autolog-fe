import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Design System empty state component.
 *
 * Renders a placeholder for empty content states (no vehicles, no logs, etc.),
 * styled exclusively with SCSS design tokens (see
 * `presentation/shared/styles/_tokens.scss`). No third-party UI library (e.g.
 * Ionic's `ion-card`) is used for visual rendering, per Requirements 12.3 and
 * 12.5.
 *
 * Typically shown when a list or container has no items to display.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  /** The icon or emoji displayed in the empty state. */
  @Input() icon = '📭';

  /** The main heading text describing the empty state. */
  @Input() title = 'No items';

  /** Optional description text providing more context. */
  @Input() description?: string;
}
