import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateMechanicData, Mechanic } from '../models/mechanic.model';

export abstract class MechanicService {
  abstract getMechanicsResource(): HttpResourceRef<Mechanic[] | undefined>;
  abstract getMechanicResource(id: Signal<string>): HttpResourceRef<Mechanic | undefined>;
  abstract createMechanic(data: CreateMechanicData): Observable<Mechanic>;
  abstract updateMechanic(id: string, data: CreateMechanicData): Observable<Mechanic>;
  abstract deleteMechanic(id: string): Observable<void>;
}
