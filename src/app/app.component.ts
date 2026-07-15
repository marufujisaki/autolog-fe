import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Inject TranslationService to initialize translations at app startup
  private translationService = inject(TranslationService);

  constructor() {}
}
