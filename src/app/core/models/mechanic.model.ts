export enum MechanicSource {
  PERSONAL = 'PERSONAL',
  WORKSHOP = 'WORKSHOP',
}

export interface Mechanic {
  id: string;
  source: MechanicSource;
  ownerUserId?: string;
  workshopId?: string;
  linkedUserId?: string;
  name: string;
  phone?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMechanicData {
  source: MechanicSource;
  name: string;
  phone?: string;
  description?: string;
}
