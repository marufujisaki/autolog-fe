/**
 * Photo-related interfaces (domain models for the frontend).
 */

/** A photo attached to a maintenance log as evidence of work performed. */
export interface LogPhoto {
  id: string;
  logId: string;
  url: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
}
