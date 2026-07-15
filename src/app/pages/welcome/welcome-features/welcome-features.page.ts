import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../presentation/shared/components/button/button.component';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  WrenchIcon,
  ShieldIcon,
  MapPinIcon,
  BellIcon,
} from 'lucide-angular';

interface Feature {
  title: string;
  icon: any;
  description: string;
}

/**
 * WelcomeFeaturesPage — App features overview (Figma: "Personal 2" frame).
 * Shows the key features of AutoLog before registration.
 */
@Component({
  selector: 'app-welcome-features',
  templateUrl: './welcome-features.page.html',
  styleUrls: ['./welcome-features.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, LucideAngularModule],
})
export class WelcomeFeaturesPage {
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;

  features: Feature[] = [
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
        'Crea un catálogo de tus talleres de confianza o mecánicos favoritos para tener sus datos siempre a mano.',
    },
    {
      title: 'Recordatorios Inteligentes',
      icon: BellIcon,
      description:
        'Recibe notificaciones sobre próximos servicios recomendados, como cambios de aceite, rotación de neumáticos o limpieza de inyectores.',
    },
  ];

  navigateToSignUp(): void {
    void this.router.navigate(['/sign-up']);
  }

  goBack(): void {
    void this.router.navigate(['/']);
  }
}
