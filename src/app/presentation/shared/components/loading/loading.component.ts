import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading animation size variants supported by the Design System loading component.
 * Defaults to "md" per Requirement 12.4.
 */
export type LoadingSize = 'sm' | 'md' | 'lg';

/**
 * Design System loading component.
 *
 * Renders a spinner or skeleton placeholder, styled exclusively with SCSS
 * design tokens (see `presentation/shared/styles/_tokens.scss`). No third-party
 * UI library (e.g. Ionic's `ion-spinner`) is used for visual rendering, per
 * Requirements 12.3 and 12.5.
 *
 * Typically used to indicate asynchronous operations like data fetching or
 * form submission.
 */
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {
  /** Size of the spinner. Defaults to "md" (Requirement 12.4). */
  @Input() size: LoadingSize = 'md';

  /** Optional loading text displayed below the spinner. */
  @Input() text?: string;

  /** Accessible label for the loading indicator. */
  @Input() ariaLabel = 'Loading';
}
