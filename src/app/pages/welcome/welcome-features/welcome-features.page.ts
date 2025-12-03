import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  WrenchIcon,
  ShieldIcon,
  MapPinIcon,
  BellIcon,
} from 'lucide-angular';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { CardComponent } from 'src/app/shared/components/card/card.component';

@Component({
  selector: 'app-welcome-features',
  templateUrl: './welcome-features.page.html',
  styleUrls: ['./welcome-features.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    CardComponent,
    ButtonComponent,
    LucideAngularModule,
    RouterModule
],
})
export class WelcomeFeaturesPage {
  readonly ChevronLeftIcon = ChevronLeftIcon;

  features = [
    {
      title: 'Historial Mecánico Centralizado',
      icon: WrenchIcon,
      description:
        'Registra y mantén un historial completo de todos los servicios y reparaciones de un solo vehículo particular.',
    },
    {
      title: 'Bóveda de Documentos Segura',
      icon: ShieldIcon,
      description:
        'Guarda de forma segura documentos importantes de tu vehículo (seguro, registro, facturas, etc.) en un único lugar de fácil acceso.',
    },
    {
      title: 'Directorio de Profesionales',
      icon: MapPinIcon,
      description:
        'Crea un catalogo de tus talleres de confianza o mecánicos favoritos para tener sus datos siempre a mano.',
    },
    {
      title: 'Recordatorios Inteligentes',
      icon: BellIcon,
      description:
        'Recibe notificaciones sobre próximos servicios recomendados, como cambios de aceite, rotación de neumáticos o limpieza de inyectores.',
    },
  ];
}
