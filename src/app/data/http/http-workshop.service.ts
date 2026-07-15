import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkshopService, Workshop } from '../../core/ports/workshop.port';

/**
 * HTTP implementation of WorkshopService.
 * Provides read-only access to workshop data.
 * Requirement 9.3, 9.5: Workshop management (read-only)
 */
@Injectable()
export class HttpWorkshopService extends WorkshopService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/workshops';

  /**
   * Get workshop information by ID.
   * Requirement 9.4: Verify workshop existence before granting mechanic access
   * Requirement 9.5: Read-only access to workshop data (name, address)
   */
  override getWorkshop(workshopId: string): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.apiUrl}/${workshopId}`);
  }
}
