import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome-features',
  templateUrl: './welcome-features.page.html',
  styleUrls: ['./welcome-features.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class WelcomeFeaturesPage {}
