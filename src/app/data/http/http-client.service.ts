import { Injectable, Signal } from '@angular/core';
import { HttpResourceRef, httpResource } from '@angular/common/http';
import { ClientService } from '../../core/ports/client.port';
import { Client } from '../../core/models/client.model';
import { environment } from '../../../environments/environment';

/** HTTP implementation of ClientService. Read-only — GET /api/clients. */
@Injectable()
export class HttpClientService extends ClientService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  override getClientsResource(enabled: Signal<boolean>): HttpResourceRef<Client[] | undefined> {
    return httpResource<Client[]>(() => (enabled() ? this.apiUrl : undefined));
  }
}
