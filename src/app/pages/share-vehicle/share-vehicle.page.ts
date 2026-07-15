import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonLabel,
  IonSpinner,
  IonBackButton,
  IonButtons,
  IonText,
  IonAlert,
  IonLoading,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ShareService } from '../../core/ports/share.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Vehicle } from '../../core/models/vehicle.model';
import { VehicleShareInfo, ShareStatus } from '../../core/models/share.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { QRCodeComponent } from 'angularx-qrcode';

/**
 * Share Vehicle page for generating and managing share links/QR codes.
 * Validates: Requirements 8.1, 8.3, 8.6
 */
@Component({
  selector: 'app-share-vehicle',
  templateUrl: './share-vehicle.page.html',
  styleUrls: ['./share-vehicle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonLabel,
    IonSpinner,
    IonBackButton,
    IonButtons,
    IonText,
    IonAlert,
    IonLoading,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    RouterModule,
    TranslatePipe,
    ButtonComponent,
    QRCodeComponent,
  ],
})
export class ShareVehiclePage implements OnInit, OnDestroy {
  private readonly shareService = inject(ShareService);
  private readonly vehicleService = inject(VehicleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  vehicle: Vehicle | null = null;
  vehicleShare: VehicleShareInfo | null = null;
  isLoadingVehicle = false;
  isGeneratingShare = false;
  isRevokingShare = false;
  showRevokeAlert = false;
  qrValue: string | null = null;
  ShareStatus = ShareStatus;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const vehicleId = params['vehicleId'];
      if (vehicleId) {
        this.loadVehicle(vehicleId);
        this.loadShareInfo(vehicleId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load vehicle details
   */
  private loadVehicle(vehicleId: string): void {
    this.isLoadingVehicle = true;
    this.vehicleService
      .getVehicle(vehicleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
          this.isLoadingVehicle = false;
        },
        error: (error) => {
          console.error('Failed to load vehicle:', error);
          this.isLoadingVehicle = false;
        },
      });
  }

  /**
   * Load existing share information for the vehicle
   */
  private loadShareInfo(vehicleId: string): void {
    // The share info would typically be fetched from the backend
    // For now, we initialize it as null until a share is generated
  }

  /**
   * Generate a new share link with QR code
   * Requirement 8.1: Generate cryptographically random token with 24h expiration
   * Requirement 8.3: Revoke previous PENDING shares
   */
  generateShareLink(): void {
    if (!this.vehicle) {
      return;
    }

    this.isGeneratingShare = true;
    this.shareService
      .generateShareLink(this.vehicle.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (shareInfo) => {
          this.vehicleShare = shareInfo;
          // Set QR code value to the share URL if available
          this.qrValue = shareInfo.shareUrl || shareInfo.shareToken;
          this.isGeneratingShare = false;
        },
        error: (error) => {
          console.error('Failed to generate share link:', error);
          this.isGeneratingShare = false;
        },
      });
  }

  /**
   * Revoke the current share
   * Requirement 8.6: Terminate workshop's access to the vehicle
   */
  revokeShare(): void {
    if (!this.vehicle) {
      return;
    }

    this.showRevokeAlert = false;
    this.isRevokingShare = true;

    this.shareService
      .revokeShare(this.vehicle.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.vehicleShare = null;
          this.qrValue = null;
          this.isRevokingShare = false;
        },
        error: (error) => {
          console.error('Failed to revoke share:', error);
          this.isRevokingShare = false;
        },
      });
  }

  /**
   * Open confirmation dialog for revoke action
   */
  openRevokeConfirmation(): void {
    this.showRevokeAlert = true;
  }

  /**
   * Cancel revoke action
   */
  cancelRevoke(): void {
    this.showRevokeAlert = false;
  }

  /**
   * Copy share link to clipboard
   */
  copyShareLink(): void {
    if (!this.vehicleShare?.shareUrl && !this.vehicleShare?.shareToken) {
      return;
    }

    const textToCopy =
      this.vehicleShare.shareUrl || this.vehicleShare.shareToken;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        // Show success notification
        console.log('Share link copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy share link:', error);
      });
  }

  /**
   * Get time remaining until share expires
   */
  getTimeRemaining(): string {
    if (!this.vehicleShare?.expiresAt) {
      return '';
    }

    const expirationTime = new Date(this.vehicleShare.expiresAt).getTime();
    const now = new Date().getTime();
    const timeRemaining = expirationTime - now;

    if (timeRemaining <= 0) {
      return this.translateService.instant('SHARE.EXPIRED');
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    return `${hours}h ${minutes}m`;
  }

  /**
   * Go back to vehicle detail page
   */
  goBack(): void {
    this.router.navigate(['/vehicles', this.vehicle?.id]);
  }

  /**
   * Get buttons for the revoke alert
   */
  getRevokeAlertButtons() {
    return [
      {
        text: this.translateService.instant('COMMON.CANCEL'),
        role: 'cancel',
        handler: () => this.cancelRevoke(),
      },
      {
        text: this.translateService.instant('SHARE.REVOKE'),
        role: 'destructive',
        handler: () => this.revokeShare(),
      },
    ];
  }
}
