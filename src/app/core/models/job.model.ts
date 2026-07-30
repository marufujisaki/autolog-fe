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

/** A line item within a job (e.g. "Oil Filter" qty 1 $40). */
export interface JobItem {
  id?: string;
  jobId?: string;
  name: string;
  quantity: number;
  unitCost: number;
  sortOrder?: number;
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
  items: JobItem[];
}

/** Data submitted when adding a job to a maintenance log. */
export interface CreateJobData {
  title: string;
  icon?: string;
  description?: string;
  cost?: number;
  maintenanceTypes: MaintenanceType[];
  items?: JobItemData[];
}

/** Data submitted when adding an item to a job. */
export interface JobItemData {
  name: string;
  quantity: number;
  unitCost: number;
}
