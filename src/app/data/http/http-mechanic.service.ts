import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMechanicData, Mechanic } from '../../core/models/mechanic.model';
import { MechanicService } from '../../core/ports/mechanic.port';

@Injectable()
export class HttpMechanicService extends MechanicService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/mechanics`;

  getMechanicsResource(): HttpResourceRef<Mechanic[] | undefined> {
    return httpResource<Mechanic[]>(() => this.url);
  }
  getMechanicResource(id: Signal<string>): HttpResourceRef<Mechanic | undefined> {
    return httpResource<Mechanic>(() => (id() ? `${this.url}/${id()}` : undefined));
  }
  createMechanic(data: CreateMechanicData): Observable<Mechanic> { return this.http.post<Mechanic>(this.url, data); }
  updateMechanic(id: string, data: CreateMechanicData): Observable<Mechanic> { return this.http.put<Mechanic>(`${this.url}/${id}`, data); }
  deleteMechanic(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
