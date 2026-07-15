import { Routes } from '@angular/router';
import { WelcomePage } from './welcome.page';

export const routes: Routes = [
  {
    path: '',
    component: WelcomePage,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./welcome-selection/welcome-selection.page').then(
            (m) => m.WelcomeSelectionPage,
          ),
      },
      {
        path: 'features',
        loadComponent: () =>
          import('./welcome-features/welcome-features.page').then(
            (m) => m.WelcomeFeaturesPage,
          ),
      },
    ],
  },
];
