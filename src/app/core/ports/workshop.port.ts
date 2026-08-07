/**
 * Abstract port for workshop management.
 * Presentation components depend on this abstraction for read-only workshop access.
 * Implemented by: HttpWorkshopService (data layer)
 *
 * Requirement 9.5: Expose workshop name and address as read-only data accessible to mechanics
 */

import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';

export interface Workshop {
  id: string;
  name: string;
  address: string;
}

export abstract class WorkshopService {
  /**
   * Live resource for workshop information, keyed on `workshopId`.
   * Requirement 9.4: Verify workshop existence before granting mechanic access
   * Requirement 9.5: Read-only access to workshop data (name, address)
   */
  abstract getWorkshopResource(workshopId: Signal<string>): HttpResourceRef<Workshop | undefined>;
}
