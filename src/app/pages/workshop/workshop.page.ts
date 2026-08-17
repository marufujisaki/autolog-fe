import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WorkshopService, Workshop } from '../../core/ports/workshop.port';
import { AuthService } from '../../core/ports/auth.port';
import { CardComponent } from '../../presentation/shared/components/card/card.component';
import { LoadingComponent } from '../../presentation/shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../presentation/shared/components/empty-state/empty-state.component';
import { UserType } from '../../core/models/user.model';
import { CircleAlertIcon } from 'lucide-angular';

/**
 * Workshop page for displaying workshop information to mechanics.
 * Requirement 9.5: Read-only workshop information display
 * Requirement 10.5: Workshop page (read-only) for mechanics showing workshop name and address
 */
@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.page.html',
  styleUrls: ['./workshop.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslatePipe,
    CardComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
})
export class WorkshopPage {
  private readonly workshopService = inject(WorkshopService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  workshop: Workshop | null = null;
  isLoading = false;
  error: string | null = null;

  readonly CircleAlertIcon = CircleAlertIcon;

  /**
   * Empty (idle, no fetch) unless the current user is a mechanic with a
   * workshop. Reads `authService.user()` — safe synchronously here because
   * this page is only ever reached past `authGuard`, which already awaited
   * `hasValidSession()`, so a user is guaranteed to be populated by now.
   */
  private readonly workshopIdSignal = computed(() => {
    const user = this.authService.user();
    return user?.userType === UserType.MECHANIC ? (user.workshopId ?? '') : '';
  });
  private readonly workshopResource = this.workshopService.getWorkshopResource(
    this.workshopIdSignal,
  );

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (!user) {
        this.router.navigate(['/']);
        return;
      }
      if (user.userType !== UserType.MECHANIC || !user.workshopId) {
        this.error = this.translateService.instant('workshop.noWorkshop');
        return;
      }

      this.isLoading = this.workshopResource.isLoading();
      const workshop = this.workshopResource.value();
      if (workshop) {
        this.workshop = workshop;
      }
      if (this.workshopResource.error()) {
        this.error = this.translateService.instant('workshop.noWorkshop');
      }
    });
  }

  /**
   * Navigate back to the previous page or profile.
   */
  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
