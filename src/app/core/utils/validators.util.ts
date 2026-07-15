/**
 * Pure validation utilities for vehicle, maintenance log, and job forms.
 *
 * Each function returns a map of field name to error code (not a
 * user-facing message) so the presentation layer can resolve the code to a
 * translated string via @ngx-translate. An empty object means the data is
 * valid.
 */

import { CreateJobData } from '../models/job.model';
import { CreateLogData } from '../models/maintenance-log.model';
import { CreateVehicleData } from '../models/vehicle.model';

/** Map of field name to validation error code. Empty when data is valid. */
export type ValidationErrors = Record<string, string>;

const VEHICLE_MIN_YEAR = 1886;
const VEHICLE_BRAND_MAX_LENGTH = 50;
const VEHICLE_MODEL_MAX_LENGTH = 50;
const JOB_TITLE_MAX_LENGTH = 255;
const LOG_MAX_JOBS = 50;

function isBlank(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validates vehicle creation/update data (Requirement 4.1, 4.5).
 *
 * - brand: required, non-blank, max 50 characters
 * - model: required, non-blank, max 50 characters
 * - year: required, between 1886 and current year + 1
 *
 * @param data vehicle data to validate
 * @returns map of field to error code; empty when valid
 */
export function validateVehicle(data: CreateVehicleData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(data.brand)) {
    errors['brand'] = 'required';
  } else if (data.brand.length > VEHICLE_BRAND_MAX_LENGTH) {
    errors['brand'] = 'maxLength';
  }

  if (isBlank(data.model)) {
    errors['model'] = 'required';
  } else if (data.model.length > VEHICLE_MODEL_MAX_LENGTH) {
    errors['model'] = 'maxLength';
  }

  const maxYear = new Date().getFullYear() + 1;
  if (data.year === undefined || data.year === null) {
    errors['year'] = 'required';
  } else if (data.year < VEHICLE_MIN_YEAR || data.year > maxYear) {
    errors['year'] = 'range';
  }

  return errors;
}

/**
 * Validates maintenance log creation data (Requirement 5.1, 5.6, 5.9).
 *
 * - jobs: at least 1 job, at most 50 jobs
 * - serviceDate: must not be in the future
 *
 * Individual jobs are not validated here; use {@link validateJob} for each
 * job in `data.jobs`.
 *
 * @param data log data to validate
 * @returns map of field to error code; empty when valid
 */
export function validateLog(data: CreateLogData): ValidationErrors {
  const errors: ValidationErrors = {};

  const jobCount = data.jobs?.length ?? 0;
  if (jobCount === 0) {
    errors['jobs'] = 'required';
  } else if (jobCount > LOG_MAX_JOBS) {
    errors['jobs'] = 'maxCount';
  }

  if (data.serviceDate) {
    const serviceDate = new Date(data.serviceDate);
    const now = new Date();
    if (serviceDate.getTime() > now.getTime()) {
      errors['serviceDate'] = 'futureDate';
    }
  } else {
    errors['serviceDate'] = 'required';
  }

  return errors;
}

/**
 * Validates a single job within a maintenance log (Requirement 6.1, 6.4).
 *
 * - title: required, non-blank, max 255 characters
 * - maintenanceTypes: at least one type selected
 *
 * @param data job data to validate
 * @returns map of field to error code; empty when valid
 */
export function validateJob(data: CreateJobData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (isBlank(data.title)) {
    errors['title'] = 'required';
  } else if (data.title.length > JOB_TITLE_MAX_LENGTH) {
    errors['title'] = 'maxLength';
  }

  if (!data.maintenanceTypes || data.maintenanceTypes.length === 0) {
    errors['maintenanceTypes'] = 'required';
  }

  return errors;
}
