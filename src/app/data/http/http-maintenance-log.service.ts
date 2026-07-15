/**
 * HTTP implementation of the MaintenanceLogService port (Requirement 11.2, 11.4).
 *
 * Note on getLog: the backend's MaintenanceLogController does not currently
 * expose a GET /api/logs/{logId} endpoint (only list-by-vehicle, create,
 * delete, addJob and removeJob). This method targets that path anyway to
 * satisfy the abstract port's contract; it should start working once the
 * corresponding endpoint is added to the backend.
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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

  getLogs(
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

  getLog(logId: string): Observable<MaintenanceLog> {
    return this.http.get<MaintenanceLog>(`${this.logsUrl}/${logId}`);
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

  deleteLog(logId: string): Observable<void> {
    return this.http.delete<void>(`${this.logsUrl}/${logId}`);
  }

  addJob(logId: string, data: CreateJobData): Observable<Job> {
    return this.http.post<Job>(`${this.logsUrl}/${logId}/jobs`, data);
  }

  removeJob(logId: string, jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.logsUrl}/${logId}/jobs/${jobId}`);
  }
}
