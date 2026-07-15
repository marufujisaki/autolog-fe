import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import {
  LucideAngularModule,
  UserRoundIcon,
  HandshakeIcon,
  WrenchIcon,
} from 'lucide-angular';

interface UserTypeOption {
  id: string;
  title: string;
  icon: any;
  description: string;
}

/**
 * WelcomeSelectionPage — Role selection screen (Figma: "Init" frame).
 * Lets the user choose their role: Person, Client, or Mechanic.
 * Requirements: 1.1, 2.1
 */
@Component({
  selector: 'app-welcome-selection',
  templateUrl: './welcome-selection.page.html',
  styleUrls: ['./welcome-selection.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, LucideAngularModule],
})
export class WelcomeSelectionPage {
  private router = inject(Router);

  selectedType: string | null = null;

  userTypes: UserTypeOption[] = [
    {
      id: 'USUARIO',
      title: 'Person',
      icon: UserRoundIcon,
      description: 'I do my own mechanic',
    },
    {
      id: 'CLIENTE',
      title: 'Client',
      icon: HandshakeIcon,
      description: 'Track my vehicle on taller',
    },
    {
      id: 'MECANICO',
      title: 'Mechanic',
      icon: WrenchIcon,
      description: 'Manage clients & services',
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
