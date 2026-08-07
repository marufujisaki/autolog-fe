import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Avatar size variants supported by the Design System avatar.
 * Defaults to "md" per Requirement 12.4.
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Design System avatar component.
 *
 * Renders a circular image container or initials fallback, styled exclusively
 * with SCSS design tokens (see `presentation/shared/styles/_tokens.scss`). No
 * third-party UI library (e.g. Ionic's `ion-avatar`) is used for visual
 * rendering, per Requirements 12.3 and 12.5.
 *
 * Typically used to display user profile pictures or initials.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  /** URL to the image displayed in the avatar. */
  readonly imageUrl = input<string>();

  /** Initials or short text shown as fallback when no image is provided. */
  readonly initials = input<string>();

  /** Size of the avatar. Defaults to "md" (Requirement 12.4). */
  readonly size = input<AvatarSize>('md');

  /** Accessible alt text or description for the avatar. */
  readonly ariaLabel = input<string>();
}
