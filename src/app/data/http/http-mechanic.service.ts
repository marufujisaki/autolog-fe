import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateMechanicData, Mechanic } from '../../core/models/mechanic.model';
import { MechanicService } from '../../core/ports/mechanic.port';

@Injectable()
export class HttpMechanicService extends MechanicService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/mechanics`;

  getMechanics(): Observable<Mechanic[]> { return this.http.get<Mechanic[]>(this.url); }
  getMechanic(id: string): Observable<Mechanic> { return this.http.get<Mechanic>(`${this.url}/${id}`); }
  createMechanic(data: CreateMechanicData): Observable<Mechanic> { return this.http.post<Mechanic>(this.url, data); }
  updateMechanic(id: string, data: CreateMechanicData): Observable<Mechanic> { return this.http.put<Mechanic>(`${this.url}/${id}`, data); }
  deleteMechanic(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
