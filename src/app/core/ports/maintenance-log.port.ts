/**
 * Abstract port for maintenance log and job management.
 * Implemented by: HttpMaintenanceLogService (data layer)
 */

import { Observable } from 'rxjs';
import { CreateJobData, Job } from '../models/job.model';
import {
  CreateLogData,
  MaintenanceLog,
  PaginatedResponse,
} from '../models/maintenance-log.model';

export abstract class MaintenanceLogService {
  abstract getLogs(
    vehicleId: string,
    page: number,
    size: number,
  ): Observable<PaginatedResponse<MaintenanceLog>>;
  abstract getLog(logId: string): Observable<MaintenanceLog>;
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
  abstract getMechanicNames(): Observable<string[]>;
}
