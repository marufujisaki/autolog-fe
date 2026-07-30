import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  WrenchIcon,
  ShieldIcon,
  MapPinIcon,
  BellIcon,
} from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';

interface Feature {
  titleKey: string;
  descriptionKey: string;
  icon: any;
}

/**
 * WelcomeFeaturesPage — App features overview.
 * Shows the key features of AutoLog before registration.
 */
@Component({
  selector: 'app-welcome-features',
  templateUrl: './welcome-features.page.html',
  styleUrls: ['./welcome-features.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    LucideAngularModule,
    ButtonComponent,
    TranslatePipe,
  ],
})
export class WelcomeFeaturesPage {
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  features: Feature[] = [
    {
      titleKey: 'auth.features.mechanicHistory',
      icon: WrenchIcon,
      descriptionKey: 'auth.features.mechanicHistoryDesc',
    },
    {
      titleKey: 'auth.features.documentVault',
      icon: ShieldIcon,
      descriptionKey: 'auth.features.documentVaultDesc',
    },
    {
      titleKey: 'auth.features.professionalDirectory',
      icon: MapPinIcon,
      descriptionKey: 'auth.features.professionalDirectoryDesc',
    },
    {
      titleKey: 'auth.features.smartReminders',
      icon: BellIcon,
      descriptionKey: 'auth.features.smartRemindersDesc',
    },
  ];

  navigateToSignUp(): void {
    void this.router.navigate(['/sign-up']);
  }

  navigateToLogin(): void {
    void this.router.navigate(['/login']);
  }

  goBack(): void {
    void this.router.navigate(['/']);
  }
}
