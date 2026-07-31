import { Component } from '@angular/core';

/**
 * Design System brand wordmark.
 *
 * Single source of truth for the AutoLog logotype: Montserrat Bold 24px,
 * "Auto" on #070707 and "Log" on the primary blue, as used across the app
 * (dashboard and welcome screens). Replaces the per-page markup that had
 * drifted between screens.
 */
@Component({
  selector: 'app-brand',
  standalone: true,
  template: `<h1 class="app-brand">
    Auto<span class="app-brand__accent">Log</span>
  </h1>`,
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent {}
