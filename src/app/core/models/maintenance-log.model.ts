/**
 * Maintenance log-related interfaces (domain models for the frontend).
 */

import { CreateJobData, Job } from './job.model';
import { LogPhoto } from './photo.model';

/** A maintenance log representing a service visit for a vehicle. */
export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  createdBy: string;
  serviceDate: string;
  mileageAtService: number;
  totalCost?: number;
  jobs: Job[];
  photos: LogPhoto[];
  createdAt: string;
}

/** Data submitted when creating a maintenance log. */
export interface CreateLogData {
  serviceDate: string;
  mileageAtService: number;
  totalCost?: number;
  jobs: CreateJobData[];
}

/** Generic paginated response envelope returned by list endpoints. */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
