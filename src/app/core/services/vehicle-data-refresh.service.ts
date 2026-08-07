import { Injectable, Signal, signal } from '@angular/core';

/**
 * Notifies listeners that vehicle-related data changed and should be
 * reloaded. Used when creation happens in an overlay, without a route
 * change that would otherwise re-create the underlying page.
 *
 * A monotonically increasing counter rather than a boolean/void pulse: it's
 * the natural reactive parameter for `httpResource()` consumers — reading
 * `refreshTrigger()` inside a resource's `request` function makes that
 * resource automatically refetch whenever this changes.
 */
@Injectable({
  providedIn: 'root',
})
export class VehicleDataRefreshService {
  private readonly refreshTriggerSignal = signal(0);

  /** Reactive dependency: read inside a `computed()`/`httpResource()`/`effect()` to react on every change. */
  readonly refreshTrigger: Signal<number> = this.refreshTriggerSignal.asReadonly();

  notifyChanged(): void {
    this.refreshTriggerSignal.update((v) => v + 1);
  }
}
