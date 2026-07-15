import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  VehicleCatalogService,
  CatalogMake,
  CatalogModel,
  JobOption,
} from '../../core/ports/vehicle-catalog.port';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpVehicleCatalogService extends VehicleCatalogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/v1/catalog`;

  searchMakes(query: string): Observable<CatalogMake[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<CatalogMake[]>(`${this.baseUrl}/makes`, { params });
  }

  searchModels(makeName: string, query: string): Observable<CatalogModel[]> {
    const params = new HttpParams().set('make', makeName).set('q', query);
    return this.http.get<CatalogModel[]>(`${this.baseUrl}/models`, { params });
  }

  searchJobs(query: string): Observable<JobOption[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<JobOption[]>(`${this.baseUrl}/jobs`, { params });
  }
}
