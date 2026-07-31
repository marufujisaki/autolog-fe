import { Observable } from 'rxjs';
import { CreateMechanicData, Mechanic } from '../models/mechanic.model';

export abstract class MechanicService {
  abstract getMechanics(): Observable<Mechanic[]>;
  abstract getMechanic(id: string): Observable<Mechanic>;
  abstract createMechanic(data: CreateMechanicData): Observable<Mechanic>;
  abstract updateMechanic(id: string, data: CreateMechanicData): Observable<Mechanic>;
  abstract deleteMechanic(id: string): Observable<void>;
}
