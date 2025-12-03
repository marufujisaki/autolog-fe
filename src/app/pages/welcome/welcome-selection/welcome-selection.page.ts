import { Component } from '@angular/core';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  UserRoundIcon,
  HandshakeIcon,
  WrenchIcon,
} from 'lucide-angular';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'app-welcome-selection',
  templateUrl: './welcome-selection.page.html',
  styleUrls: ['./welcome-selection.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    CardComponent,
    LucideAngularModule,
    ButtonComponent
],
})
export class WelcomeSelectionPage {
  userTypes = [
    {
      id: 1,
      title: 'Usuario',
      icon: UserRoundIcon,
      description: 'Hago mi propia mecánica',
    },
    {
      id: 2,
      title: 'Cliente',
      icon: HandshakeIcon,
      description: 'Rastrear mis vehículos en taller',
    },
    {
      id: 3,
      title: 'Mecánico',
      icon: WrenchIcon,
      description: 'Gestionar mis clientes y servicios',
    },
  ];
  selectedUserTypeId: number | null = null;

  selectUserType(id: number) {
    this.selectedUserTypeId = id;
  }
}
