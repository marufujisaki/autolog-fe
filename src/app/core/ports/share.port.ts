/**
 * Abstract port for sharing vehicle access with workshops.
 * Implemented by: HttpShareService (data layer)
 */

import { Observable } from 'rxjs';
import { VehicleShareInfo } from '../models/share.model';

export abstract class ShareService {
  abstract generateShareLink(vehicleId: string): Observable<VehicleShareInfo>;
  abstract claimShare(shareToken: string, workshopId: string): Observable<void>;
  abstract revokeShare(vehicleId: string): Observable<void>;
}
