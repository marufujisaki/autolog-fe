import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';
import { Client } from '../models/client.model';

/**
 * Abstract port for the MECHANIC's client list (owners of vehicles shared
 * with their workshop). Implemented by: HttpClientService (data layer).
 */
export abstract class ClientService {
  /**
   * Live resource listing clients, only fetched while `enabled()` is true —
   * callers pass an `isMechanicUser`-style signal so non-mechanic profile
   * views never hit the endpoint.
   */
  abstract getClientsResource(enabled: Signal<boolean>): HttpResourceRef<Client[] | undefined>;
}
