/**
 * HTTP implementation of the MaintenanceLogService port (Requirement 11.2, 11.4).
 */

import { HttpClient, HttpParams, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { CreateJobData, Job } from '../../core/models/job.model';
import {
  CreateLogData,
  MaintenanceLog,
  PaginatedResponse,
} from '../../core/models/maintenance-log.model';

@Injectable()
export class HttpMaintenanceLogService extends MaintenanceLogService {
  private readonly http = inject(HttpClient);

  private readonly logsUrl = `${environment.apiUrl}/logs`;

  getLogsResource(
    vehicleId: Signal<string>,
    page: Signal<number>,
    size: number,
  ): HttpResourceRef<PaginatedResponse<MaintenanceLog> | undefined> {
    return httpResource<PaginatedResponse<MaintenanceLog>>(() =>
      vehicleId()
        ? {
            url: `${environment.apiUrl}/vehicles/${vehicleId()}/logs`,
            params: { page: page(), size },
          }
        : undefined,
    );
  }

  getLogResource(logId: Signal<string>): HttpResourceRef<MaintenanceLog | undefined> {
    return httpResource<MaintenanceLog>(() =>
      logId() ? `${this.logsUrl}/${logId()}` : undefined,
    );
  }

  getLogsPage(
    vehicleId: string,
    page: number,
    size: number,
  ): Observable<PaginatedResponse<MaintenanceLog>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginatedResponse<MaintenanceLog>>(
      `${environment.apiUrl}/vehicles/${vehicleId}/logs`,
      { params },
    );
  }

  createLog(
    vehicleId: string,
    data: CreateLogData,
  ): Observable<MaintenanceLog> {
    return this.http.post<MaintenanceLog>(
      `${environment.apiUrl}/vehicles/${vehicleId}/logs`,
      data,
    );
  }

  updateLog(logId: string, data: CreateLogData): Observable<MaintenanceLog> {
    return this.http.put<MaintenanceLog>(`${this.logsUrl}/${logId}`, data);
  }

  deleteLog(logId: string): Observable<void> {
    return this.http.delete<void>(`${this.logsUrl}/${logId}`);
  }

  addJob(logId: string, data: CreateJobData): Observable<Job> {
    return this.http.post<Job>(`${this.logsUrl}/${logId}/jobs`, data);
  }

  removeJob(logId: string, jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.logsUrl}/${logId}/jobs/${jobId}`);
  }

  getMechanicNamesResource(): HttpResourceRef<string[] | undefined> {
    return httpResource<string[]>(() => `${this.logsUrl}/mechanic-names`);
  }
}
