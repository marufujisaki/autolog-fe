/**
 * Job-related enums and interfaces (domain models for the frontend).
 */

/** Classification of maintenance work performed on a job. */
export enum MaintenanceType {
  REPLACEMENT = 'REPLACEMENT',
  SERVICE = 'SERVICE',
  REPAIR = 'REPAIR',
  CONSUMABLE = 'CONSUMABLE',
  INSPECTION = 'INSPECTION',
}

/** An individual task performed during a maintenance log visit. */
export interface Job {
  id: string;
  logId: string;
  title: string;
  icon?: string;
  description?: string;
  cost?: number;
  maintenanceTypes: MaintenanceType[];
  sortOrder: number;
}

/** Data submitted when adding a job to a maintenance log. */
export interface CreateJobData {
  title: string;
  icon?: string;
  description?: string;
  cost?: number;
  maintenanceTypes: MaintenanceType[];
}
