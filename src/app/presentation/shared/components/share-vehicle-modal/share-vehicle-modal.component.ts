import { Component, OnDestroy, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { Share } from '@capacitor/share';
import { ShareService } from '../../../../core/ports/share.port';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { VehicleShareInfo } from '../../../../core/models/share.model';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

/**
 * "Share Vehicle" bottom sheet (Figma frame "Add Vehicle - Link client",
 * node 149:1968 / 152:*): QR code with the app logo in the center, plus a
 * "Share Link" action, so a USUARIO/CLIENTE owner can grant a mechanic
 * access to the vehicle. The QR/link is a short-lived (15 min) session —
 * while the sheet stays open past that window it silently regenerates.
 */
@Component({
  selector: 'app-share-vehicle-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonSpinner,
    TranslatePipe,
    QRCodeComponent,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './share-vehicle-modal.component.html',
  styleUrls: ['./share-vehicle-modal.component.scss'],
})
export class ShareVehicleModalComponent implements OnDestroy {
  private readonly shareService = inject(ShareService);

  readonly isOpen = input(false);
  readonly vehicle = input<Vehicle | null>(null);

  /** Emitted when the sheet is dismissed. */
  readonly closed = output<void>();

  shareInfo: VehicleShareInfo | null = null;
  qrValue: string | null = null;
  isLoading = false;
  errorMessageKey: string | null = null;

  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.isOpen() && this.vehicle()) {
        this.generateShareLink();
      } else {
        this.clearRefreshTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearRefreshTimer();
  }

  private generateShareLink(): void {
    const vehicle = this.vehicle();
    if (!vehicle) {
      return;
    }

    this.clearRefreshTimer();
    this.isLoading = true;
    this.errorMessageKey = null;

    this.shareService.generateShareLink(vehicle.id).subscribe({
      next: (shareInfo) => {
        this.shareInfo = shareInfo;
        this.qrValue = shareInfo.shareUrl || shareInfo.shareToken;
        this.isLoading = false;
        this.scheduleAutoRefresh(shareInfo.expiresAt);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessageKey = 'share.generateError';
      },
    });
  }

  /** Silently regenerates the QR/link if the sheet is still open once the 15-min session expires. */
  private scheduleAutoRefresh(expiresAt: string): void {
    const delay = new Date(expiresAt).getTime() - Date.now();
    this.refreshTimeoutId = setTimeout(
      () => {
        if (this.isOpen()) {
          this.generateShareLink();
        }
      },
      Math.max(delay, 0),
    );
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  async onShareLink(): Promise<void> {
    if (!this.qrValue) {
      return;
    }

    try {
      await Share.share({ url: this.qrValue });
      return;
    } catch {
      // Native share sheet unavailable/cancelled — fall through to web APIs.
    }

    if (navigator.share) {
      try {
        await navigator.share({ url: this.qrValue });
        return;
      } catch {
        // User dismissed the share sheet — fall through to clipboard copy.
      }
    }

    await navigator.clipboard.writeText(this.qrValue);
  }

  onClose(): void {
    this.closed.emit();
  }
}
