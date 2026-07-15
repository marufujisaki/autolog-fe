import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * WelcomePage — Shell component for the welcome flow.
 * Contains an outlet for sub-pages (selection, features).
 * Requirements: 1.1, 1.3, 2.1
 */
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class WelcomePage {}
