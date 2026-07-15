/**
 * HTTP implementation of the ShareService port (Requirement 11.2, 11.4).
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ShareService } from '../../core/ports/share.port';
import { VehicleShareInfo } from '../../core/models/share.model';

@Injectable()
export class HttpShareService extends ShareService {
  private readonly http = inject(HttpClient);

  private readonly vehiclesUrl = `${environment.apiUrl}/vehicles`;

  generateShareLink(vehicleId: string): Observable<VehicleShareInfo> {
    return this.http.post<VehicleShareInfo>(
      `${this.vehiclesUrl}/${vehicleId}/share`,
      {},
    );
  }

  claimShare(shareToken: string, workshopId: string): Observable<void> {
    return this.http.post<void>(`${this.vehiclesUrl}/claim`, {
      shareToken,
      workshopId,
    });
  }

  revokeShare(vehicleId: string): Observable<void> {
    return this.http.delete<void>(`${this.vehiclesUrl}/${vehicleId}/share`);
  }
}
