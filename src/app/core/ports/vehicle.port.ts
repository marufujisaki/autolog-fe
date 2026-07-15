/**
 * Abstract port for vehicle management.
 * Implemented by: HttpVehicleService (data layer)
 */

import { Observable } from 'rxjs';
import { CreateVehicleData, Vehicle } from '../models/vehicle.model';

export abstract class VehicleService {
  abstract getVehicles(): Observable<Vehicle[]>;
  abstract getVehicle(id: string): Observable<Vehicle>;
  abstract createVehicle(data: CreateVehicleData): Observable<Vehicle>;
  abstract updateVehicle(
    id: string,
    data: CreateVehicleData,
  ): Observable<Vehicle>;
}
