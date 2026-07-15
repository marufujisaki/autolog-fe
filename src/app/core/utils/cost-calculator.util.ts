/**
 * Pure utility that calculates the total cost of a maintenance log from its
 * jobs (Requirement 5.2, 5.3, 6.2, 6.3). Mirrors the backend CostCalculator
 * domain service.
 */

/** Minimal shape needed to compute a cost sum from a list of jobs. */
export interface JobCost {
  cost?: number | null;
}

/**
 * Calculates the total cost of a set of jobs.
 *
 * If `explicitTotalCost` is provided (not null/undefined), it is used as-is,
 * ignoring individual job costs (Requirement 5.3). Otherwise, the total is
 * calculated as the sum of all job costs, treating null/undefined costs as
 * zero (Requirement 5.2).
 *
 * @param jobs jobs of the log (may be empty or undefined)
 * @param explicitTotalCost totalCost explicitly provided by the user, or
 *     undefined/null if it should be calculated
 * @returns the resulting total cost
 */
export function calculateTotalCost(
  jobs: JobCost[] | undefined | null,
  explicitTotalCost?: number | null,
): number {
  if (explicitTotalCost !== undefined && explicitTotalCost !== null) {
    return explicitTotalCost;
  }
  return sumJobCosts(jobs);
}

function sumJobCosts(jobs: JobCost[] | undefined | null): number {
  if (!jobs) {
    return 0;
  }
  return jobs.reduce((sum, job) => sum + (job?.cost ?? 0), 0);
}
