/**
 * HTTP implementation of the PhotoService port (Requirement 11.2, 11.4).
 */

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PhotoService } from '../../core/ports/photo.port';
import { LogPhoto } from '../../core/models/photo.model';

@Injectable()
export class HttpPhotoService extends PhotoService {
  private readonly http = inject(HttpClient);

  uploadPhotos(logId: string, files: File[]): Observable<LogPhoto[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    return this.http.post<LogPhoto[]>(
      `${environment.apiUrl}/logs/${logId}/photos`,
      formData,
    );
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/photos/${photoId}`);
  }
}
