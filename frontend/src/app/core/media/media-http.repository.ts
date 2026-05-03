import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../http/api-response.helpers';
import { ApiResponse } from '../models/app.models';

export interface MediaAssetResponse {
  readonly id: string;
  readonly ownerUserId: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly purpose: string;
  readonly url: string | null;
  readonly originalFileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly alt: string | null;
  readonly sortOrder: number | null;
  readonly visibility: 'public' | 'private';
}

@Injectable({ providedIn: 'root' })
export class MediaHttpRepository {
  private readonly http = inject(HttpClient);

  uploadProfileAvatar(file: File): Observable<MediaAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<MediaAssetResponse>>(`${environment.apiBaseUrl}/profile/avatar`, formData)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo subir la foto de perfil.')))
      );
  }

  uploadCompanyLogo(file: File): Observable<MediaAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<MediaAssetResponse>>(`${environment.apiBaseUrl}/companies/me/logo`, formData)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo subir el logo de empresa.')))
      );
  }

  uploadListingImage(
    listingId: string,
    file: File,
    alt?: string,
    sortOrder?: number
  ): Observable<MediaAssetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (alt?.trim()) {
      formData.append('alt', alt.trim());
    }
    if (sortOrder !== undefined && sortOrder !== null) {
      formData.append('sortOrder', String(sortOrder));
    }

    return this.http
      .post<ApiResponse<MediaAssetResponse>>(`${environment.apiBaseUrl}/listings/${listingId}/media/upload`, formData)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo subir la imagen del listing.')))
      );
  }

  deleteListingImage(listingId: string, mediaId: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<{ deleted: boolean }>>(`${environment.apiBaseUrl}/listings/${listingId}/media/${mediaId}`)
      .pipe(
        map(unwrapApiResponse),
        map((response) => response.deleted),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo eliminar la imagen del listing.')))
      );
  }
}
