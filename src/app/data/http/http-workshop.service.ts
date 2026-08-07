import { Injectable, Signal, inject } from '@angular/core';
import { HttpResourceRef, httpResource } from '@angular/common/http';
import { WorkshopService, Workshop } from '../../core/ports/workshop.port';

/**
 * HTTP implementation of WorkshopService.
 * Provides read-only access to workshop data.
 * Requirement 9.3, 9.5: Workshop management (read-only)
 */
@Injectable()
export class HttpWorkshopService extends WorkshopService {
  private readonly apiUrl = '/api/workshops';

  /**
   * Get workshop information by ID.
   * Requirement 9.4: Verify workshop existence before granting mechanic access
   * Requirement 9.5: Read-only access to workshop data (name, address)
   */
  override getWorkshopResource(workshopId: Signal<string>): HttpResourceRef<Workshop | undefined> {
    return httpResource<Workshop>(() =>
      workshopId() ? `${this.apiUrl}/${workshopId()}` : undefined,
    );
  }
}
