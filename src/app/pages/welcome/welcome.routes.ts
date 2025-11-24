import { Routes } from '@angular/router';
import { WelcomeSelectionPage } from './welcome-selection/welcome-selection.page';
import { WelcomeFeaturesPage } from './welcome-features/welcome-features.page';

export const routes: Routes = [
  {
    path: '',
    component: WelcomeSelectionPage,
  },
  {
    path: 'features',
    component: WelcomeFeaturesPage
  }
];
