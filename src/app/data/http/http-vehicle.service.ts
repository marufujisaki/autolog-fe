/**
 * HTTP implementation of the VehicleService port (Requirement 11.2, 11.4).
 */

import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { VehicleService } from '../../core/ports/vehicle.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { CreateVehicleData, Vehicle } from '../../core/models/vehicle.model';

@Injectable()
export class HttpVehicleService extends VehicleService {
  private readonly http = inject(HttpClient);
  private readonly dataRefresh = inject(VehicleDataRefreshService);

  private readonly baseUrl = `${environment.apiUrl}/vehicles`;

  getVehiclesResource(): HttpResourceRef<Vehicle[] | undefined> {
    return httpResource<Vehicle[]>(() => {
      this.dataRefresh.refreshTrigger(); // reactive dependency — refetch on change
      return this.baseUrl;
    });
  }

  getVehicleResource(id: Signal<string>): HttpResourceRef<Vehicle | undefined> {
    return httpResource<Vehicle>(() => (id() ? `${this.baseUrl}/${id()}` : undefined));
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
