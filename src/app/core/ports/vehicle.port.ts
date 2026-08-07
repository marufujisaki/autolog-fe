/**
 * Abstract port for vehicle management.
 * Implemented by: HttpVehicleService (data layer)
 */

import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateVehicleData, Vehicle } from '../models/vehicle.model';

export abstract class VehicleService {
  /**
   * Live resource for the authenticated user's vehicles. Reactively
   * refetches whenever `VehicleDataRefreshService`'s trigger changes (i.e.
   * after any create/update/delete elsewhere calls `notifyChanged()`) — no
   * manual subscription/reload wiring needed at the call site.
   */
  abstract getVehiclesResource(): HttpResourceRef<Vehicle[] | undefined>;

  /**
   * Live resource for a single vehicle. `id` is a Signal so the resource
   * reactively refetches if the id changes (e.g. driven by a route param).
   */
  abstract getVehicleResource(id: Signal<string>): HttpResourceRef<Vehicle | undefined>;

  abstract createVehicle(data: CreateVehicleData): Observable<Vehicle>;
  abstract updateVehicle(
    id: string,
    data: CreateVehicleData,
  ): Observable<Vehicle>;
  abstract deleteVehicle(id: string): Observable<void>;
}
