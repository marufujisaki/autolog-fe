import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/**
 * Design System empty state component.
 *
 * Renders a placeholder for empty content states (no vehicles, no logs, etc.),
 * styled exclusively with SCSS design tokens (see
 * `presentation/shared/styles/_tokens.scss`). No third-party UI library (e.g.
 * Ionic's `ion-card`) is used for visual rendering, per Requirements 12.3 and
 * 12.5. `lucide-angular` (already installed app-wide for iconography) is used
 * here for icon rendering only, same as everywhere else in the app.
 *
 * Typically shown when a list or container has no items to display.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  /**
   * The icon displayed in the empty state — either an emoji/text string
   * (rendered as-is) or a Lucide icon reference imported from
   * `lucide-angular` (e.g. `ClipboardIcon`), rendered via `<lucide-angular>`.
   */
  readonly icon = input<string | LucideIconData>('📭');

  /** The main heading text describing the empty state. */
  readonly title = input('No items');

  /** Optional description text providing more context. */
  readonly description = input<string>();

  /** Lucide icon data is an array of SVG node tuples; emoji/text icons are plain strings. */
  get iconData(): LucideIconData | null {
    const value = this.icon();
    return Array.isArray(value) ? value : null;
  }

  get iconText(): string | null {
    const value = this.icon();
    return typeof value === 'string' ? value : null;
  }
}
