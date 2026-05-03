import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import { Profile, UpdateProfilePayload } from './profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileHttpRepository {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<Profile> {
    return this.http
      .get<ApiResponse<Profile>>(`${environment.apiBaseUrl}/profile`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo cargar el perfil.')))
      );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<Profile> {
    return this.http
      .put<ApiResponse<Profile>>(`${environment.apiBaseUrl}/profile`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo guardar el perfil.')))
      );
  }
}
