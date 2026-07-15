/**
 * Vehicle share-related enums and interfaces (domain models for the frontend).
 */

/** Lifecycle status of a vehicle share token. */
export enum ShareStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

/** Information about a vehicle share (QR/link) with a workshop. */
export interface VehicleShareInfo {
  id: string;
  vehicleId: string;
  shareToken: string;
  shareUrl?: string;
  status: ShareStatus;
  workshopId?: string;
  expiresAt: string;
  claimedAt?: string;
}
