/**
 * Vehicle-related interfaces (domain models for the frontend).
 */

/** A vehicle registered in the system. */
export interface Vehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  currentMileage?: number;
  photoUrl?: string;
  cardColor?: string;
  displayName?: string;
  /** Nombre del cliente dueño del vehículo. Solo lo envía el backend cuando quien consulta es un MECHANIC. */
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
}

/** Data submitted when creating or updating a vehicle. */
export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  currentMileage?: number;
  cardColor?: string;
  displayName?: string;
}
