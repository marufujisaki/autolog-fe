/**
 * Abstract port for photo management on maintenance logs.
 * Implemented by: HttpPhotoService (data layer)
 */

import { Observable } from 'rxjs';
import { LogPhoto } from '../models/photo.model';

export abstract class PhotoService {
  abstract uploadPhotos(logId: string, files: File[]): Observable<LogPhoto[]>;
  abstract deletePhoto(photoId: string): Observable<void>;
}
