import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse, AuthSession } from '../../../core/models/app.models';
import { environment } from '../../../../environments/environment';
import { LoginPayload } from '../domain/login-screen.models';
import {
  CompanyRegistrationPayload,
  NaturalPersonRegistrationPayload
} from '../domain/register.models';

interface MeResponse {
  readonly user: AuthSession['user'];
  readonly permissions: readonly string[];
}

@Injectable({ providedIn: 'root' })
export class AuthHttpRepository {
  private readonly http = inject(HttpClient);

  loginWithEmail(payload: LoginPayload): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiBaseUrl}/auth/login`, {
        email: payload.email,
        password: payload.password,
        rememberMe: payload.rememberMe
      })
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo iniciar sesion.')))
      );
  }

  registerCompany(payload: CompanyRegistrationPayload): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiBaseUrl}/auth/register/company`, {
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        intent: payload.intent,
        company: payload.company
      })
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo completar el registro de empresa.')))
      );
  }

  registerNaturalPerson(payload: NaturalPersonRegistrationPayload): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiBaseUrl}/auth/register/person`, {
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        intent: payload.intent,
        firstName: payload.firstName,
        lastName: payload.lastName,
        documentNumber: payload.documentNumber,
        mobilePhone: payload.mobilePhone,
        address: payload.address,
        postalCode: payload.postalCode
      })
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) =>
          throwError(() => normalizeHttpError(error, 'No se pudo completar el registro de persona natural.'))
        )
      );
  }

  getMe(): Observable<MeResponse> {
    return this.http
      .get<ApiResponse<MeResponse>>(`${environment.apiBaseUrl}/auth/me`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo cargar la sesion.')))
      );
  }
}
