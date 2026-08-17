/** Vehicle summary as shown within a client's shared-vehicle list. */
export interface ClientVehicle {
  id: string;
  brand: string;
  model: string;
  licensePlate?: string;
}

/** Owner of one or more vehicles shared with the mechanic's workshop. */
export interface Client {
  id: string;
  name: string;
  phone?: string;
  email: string;
  vehicles: ClientVehicle[];
}
