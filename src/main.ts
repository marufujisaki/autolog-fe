import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { getAppProviders } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: getAppProviders(),
});
