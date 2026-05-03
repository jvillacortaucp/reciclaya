import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { normalizeHttpError, unwrapApiResponse } from '../../core/http/api-response.helpers';
import { ApiResponse } from '../../core/models/app.models';
import { environment } from '../../../environments/environment';
import {
  CreateMessagePayload,
  MarkThreadReadResult,
  MessageItem,
  MessageThreadDetail,
  MessageThreadListItem
} from './domain/messages.models';

@Injectable({ providedIn: 'root' })
export class MessagesHttpRepository {
  private readonly http = inject(HttpClient);

  listThreads(): Observable<readonly MessageThreadListItem[]> {
    return this.http
      .get<ApiResponse<readonly MessageThreadListItem[]>>(`${environment.apiBaseUrl}/messages/threads`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudieron cargar las conversaciones.'))
      );
  }

  getThread(threadId: string): Observable<MessageThreadDetail | null> {
    return this.http
      .get<ApiResponse<MessageThreadDetail>>(`${environment.apiBaseUrl}/messages/threads/${threadId}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo cargar la conversación.'))
      );
  }

  getOrCreateFromRequest(requestId: string): Observable<MessageThreadDetail> {
    return this.http
      .post<ApiResponse<MessageThreadDetail>>(`${environment.apiBaseUrl}/messages/from-request/${requestId}`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo abrir la conversación.'))
      );
  }

  sendMessage(threadId: string, payload: CreateMessagePayload): Observable<MessageItem> {
    return this.http
      .post<ApiResponse<MessageItem>>(`${environment.apiBaseUrl}/messages/threads/${threadId}/messages`, payload)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo enviar el mensaje.'))
      );
  }

  markAsRead(threadId: string): Observable<MarkThreadReadResult> {
    return this.http
      .patch<ApiResponse<MarkThreadReadResult>>(`${environment.apiBaseUrl}/messages/threads/${threadId}/read`, null)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => this.handleHttpError(error, 'No se pudo marcar la conversación como leída.'))
      );
  }

  private handleHttpError(error: unknown, fallbackMessage: string): Observable<never> {
    return throwError(() => normalizeHttpError(error, fallbackMessage));
  }
}
