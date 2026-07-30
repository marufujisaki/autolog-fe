/**
 * HTTP implementation of the VehicleService port (Requirement 11.2, 11.4).
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { VehicleService } from '../../core/ports/vehicle.port';
import { CreateVehicleData, Vehicle } from '../../core/models/vehicle.model';

@Injectable()
export class HttpVehicleService extends VehicleService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/vehicles`;

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.baseUrl);
  }

  getVehicle(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}`);
  }

  createVehicle(data: CreateVehicleData): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.baseUrl, data);
  }

  updateVehicle(id: string, data: CreateVehicleData): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.baseUrl}/${id}`, data);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
