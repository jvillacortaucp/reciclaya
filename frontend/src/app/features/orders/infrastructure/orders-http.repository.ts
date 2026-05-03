import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { normalizeHttpError, unwrapApiResponse } from '../../../core/http/api-response.helpers';
import { ApiResponse } from '../../../core/models/app.models';
import { OrderDetail, OrderListItem } from '../domain/orders.models';

@Injectable({ providedIn: 'root' })
export class OrdersHttpRepository {
  private readonly http = inject(HttpClient);

  list(): Observable<readonly OrderListItem[]> {
    return this.http
      .get<ApiResponse<readonly OrderListItem[]>>(`${environment.apiBaseUrl}/orders`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudieron cargar las ordenes.')))
      );
  }

  getById(id: string): Observable<OrderDetail | null> {
    return this.http
      .get<ApiResponse<OrderDetail>>(`${environment.apiBaseUrl}/orders/${id}`)
      .pipe(
        map(unwrapApiResponse),
        catchError((error: unknown) => throwError(() => normalizeHttpError(error, 'No se pudo cargar la orden.')))
      );
  }
}
