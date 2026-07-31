import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Notifies listeners that vehicle-related data changed and should be reloaded.
 * Used when creation happens in an overlay, without a route change that would
 * otherwise re-create the underlying page.
 */
@Injectable({
  providedIn: 'root',
})
export class VehicleDataRefreshService {
  private readonly changedSubject = new Subject<void>();

  /** Emits every time vehicles or their maintenance data changed. */
  get changed$(): Observable<void> {
    return this.changedSubject.asObservable();
  }

  notifyChanged(): void {
    this.changedSubject.next();
  }
}
