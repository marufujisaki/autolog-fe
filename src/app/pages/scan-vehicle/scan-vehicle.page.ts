import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { ShareService } from '../../core/ports/share.port';
import { AuthService } from '../../core/ports/auth.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { SwipeToDismissDirective } from '../../presentation/shared/directives/swipe-to-dismiss.directive';

/**
 * "Scan to link" page for MECHANIC users: reads the QR a vehicle owner
 * generates from the Share Vehicle sheet (or accepts the same link/token
 * pasted manually) and claims it, granting the mechanic's workshop access
 * to that vehicle. Presented as a floating overlay from the tabs shell (see
 * `TabsPage.openAddVehicle`), same pattern as `AddVehiclePage`; still
 * independently routable at `/tabs/scan-vehicle` as a full-page fallback.
 */
@Component({
  selector: 'app-scan-vehicle',
  standalone: true,
  templateUrl: './scan-vehicle.page.html',
  styleUrls: ['./scan-vehicle.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ButtonComponent,
    InputComponent,
    SwipeToDismissDirective,
  ],
})
export class ScanVehiclePage {
  private readonly shareService = inject(ShareService);
  private readonly authService = inject(AuthService);
  private readonly dataRefresh = inject(VehicleDataRefreshService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  /** When true the page is rendered as an overlay and closing emits instead of navigating. */
  readonly presentedAsModal = input(false);
  readonly dismissed = output<void>();

  readonly manualCodeControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  isScanning = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  async startCameraScan(): Promise<void> {
    this.errorMessage = null;

    try {
      let permission = await BarcodeScanner.checkPermissions();
      if (permission.camera !== 'granted') {
        permission = await BarcodeScanner.requestPermissions();
      }
      if (permission.camera !== 'granted') {
        this.errorMessage = this.translateService.instant('share.cameraPermissionDenied');
        return;
      }

      this.isScanning = true;
      const result = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
      const value = result.barcodes[0]?.rawValue || result.barcodes[0]?.displayValue;
      if (!value) {
        this.errorMessage = this.translateService.instant('share.invalidToken');
        return;
      }

      this.claim(value);
    } catch {
      this.errorMessage = this.translateService.instant('share.scanError');
    } finally {
      this.isScanning = false;
    }
  }

  submitManualCode(): void {
    if (this.manualCodeControl.invalid) {
      this.manualCodeControl.markAsTouched();
      return;
    }
    this.claim(this.manualCodeControl.value);
  }

  private claim(rawValue: string): void {
    const workshopId = this.authService.user()?.workshopId;
    if (!workshopId) {
      this.errorMessage = this.translateService.instant('share.workshopNotFound');
      return;
    }

    const shareToken = this.extractToken(rawValue);
    this.errorMessage = null;
    this.isSubmitting = true;

    this.shareService.claimShare(shareToken, workshopId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dataRefresh.notifyChanged();
        this.goBack();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error?.error?.message || this.translateService.instant('share.invalidToken');
      },
    });
  }

  goBack(): void {
    if (this.presentedAsModal()) {
      this.dismissed.emit();
      return;
    }
    void this.router.navigate(['/tabs/vehicles']);
  }

  /** Accepts a raw token, a full share URL (`?token=`), or a URL ending in the token. */
  private extractToken(rawValue: string): string {
    const trimmed = rawValue.trim();
    try {
      const url = new URL(trimmed);
      const queryToken = url.searchParams.get('token');
      if (queryToken) {
        return queryToken;
      }
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        return segments[segments.length - 1];
      }
    } catch {
      // Not a URL — treat the whole value as the raw token.
    }
    return trimmed;
  }
}
