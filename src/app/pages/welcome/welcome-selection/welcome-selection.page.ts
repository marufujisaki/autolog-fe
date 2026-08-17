import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  UserRoundIcon,
  HandshakeIcon,
  WrenchIcon,
} from 'lucide-angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';

interface UserTypeOption {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: any;
}

/**
 * WelcomeSelectionPage — Role selection screen.
 * Lets the user choose their role: Person, Client, or Mechanic.
 * Requirements: 1.1, 2.1
 */
@Component({
  selector: 'app-welcome-selection',
  templateUrl: './welcome-selection.page.html',
  styleUrls: ['./welcome-selection.page.scss'],
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
export class WelcomeSelectionPage {
  private router = inject(Router);

  selectedType: string | null = null;

  userTypes: UserTypeOption[] = [
    {
      id: 'OWNER',
      titleKey: 'auth.roles.person',
      descriptionKey: 'auth.roles.personDesc',
      icon: UserRoundIcon,
    },
    {
      id: 'CLIENT',
      titleKey: 'auth.roles.client',
      descriptionKey: 'auth.roles.clientDesc',
      icon: HandshakeIcon,
    },
    {
      id: 'MECHANIC',
      titleKey: 'auth.roles.mechanic',
      descriptionKey: 'auth.roles.mechanicDesc',
      icon: WrenchIcon,
    },
  ];

  selectUserType(userType: UserTypeOption): void {
    this.selectedType = userType.id;
  }

  navigateNext(): void {
    if (this.selectedType) {
      void this.router.navigate(['/features'], {
        queryParams: { type: this.selectedType },
      });
    }
  }

  navigateToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
