import { Observable } from 'rxjs';

export interface CatalogMake {
  id: number;
  name: string;
}

export interface CatalogModel {
  id: number;
  makeId: number;
  name: string;
}

export interface JobOption {
  id: number;
  name: string;
  icon: string;
}

/**
 * Port for vehicle catalog and job autocomplete searches.
 */
export abstract class VehicleCatalogService {
  abstract searchMakes(query: string): Observable<CatalogMake[]>;
  abstract searchModels(
    makeName: string,
    query: string,
  ): Observable<CatalogModel[]>;
  abstract searchJobs(query: string): Observable<JobOption[]>;
}
