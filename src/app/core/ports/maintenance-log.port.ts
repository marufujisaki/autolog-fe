/**
 * Abstract port for maintenance log and job management.
 * Implemented by: HttpMaintenanceLogService (data layer)
 */

import { HttpResourceRef } from '@angular/common/http';
import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateJobData, Job } from '../models/job.model';
import {
  CreateLogData,
  MaintenanceLog,
  PaginatedResponse,
} from '../models/maintenance-log.model';

export abstract class MaintenanceLogService {
  /** Reactively refetches when `vehicleId` or `page` change. */
  abstract getLogsResource(
    vehicleId: Signal<string>,
    page: Signal<number>,
    size: number,
  ): HttpResourceRef<PaginatedResponse<MaintenanceLog> | undefined>;

  abstract getLogResource(logId: Signal<string>): HttpResourceRef<MaintenanceLog | undefined>;

  /**
   * Observable escape hatch for batch/imperative reads that don't fit a
   * single stable resource — e.g. a `forkJoin` looking up one page of logs
   * per vehicle across a dynamic list (dashboard's "last updated" lookup).
   * Prefer `getLogsResource` for anything that's just "load logs for a page."
   */
  abstract getLogsPage(
    vehicleId: string,
    page: number,
    size: number,
  ): Observable<PaginatedResponse<MaintenanceLog>>;

  abstract createLog(
    vehicleId: string,
    data: CreateLogData,
  ): Observable<MaintenanceLog>;
  abstract updateLog(
    logId: string,
    data: CreateLogData,
  ): Observable<MaintenanceLog>;
  abstract deleteLog(logId: string): Observable<void>;
  abstract addJob(logId: string, data: CreateJobData): Observable<Job>;
  abstract removeJob(logId: string, jobId: string): Observable<void>;

  /** Get previously-used mechanic names for the current user */
  abstract getMechanicNamesResource(): HttpResourceRef<string[] | undefined>;
}
