import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardComponent } from '../../presentation/shared/components/card/card.component';
import { LoadingComponent } from '../../presentation/shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../presentation/shared/components/empty-state/empty-state.component';
import { UserType } from '../../core/models/user.model';

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
export class WorkshopPage implements OnInit, OnDestroy {
  private readonly workshopService = inject(WorkshopService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  workshop: Workshop | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadWorkshop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load workshop information for the current mechanic user.
   */
  private loadWorkshop(): void {
    const user = this.authService.user$;

    user.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      if (!currentUser) {
        // Not authenticated, redirect to login
        this.router.navigate(['/']);
        return;
      }

      if (
        currentUser.userType !== UserType.MECANICO ||
        !currentUser.workshopId
      ) {
        // Only mechanics have access to workshop information
        this.error = this.translateService.instant('workshop.noWorkshop');
        return;
      }

      this.isLoading = true;
      this.error = null;

      this.workshopService
        .getWorkshop(currentUser.workshopId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (workshop) => {
            this.workshop = workshop;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading workshop:', err);
            this.error = this.translateService.instant('workshop.noWorkshop');
            this.isLoading = false;
          },
        });
    });
  }

  /**
   * Navigate back to the previous page or profile.
   */
  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
