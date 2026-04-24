import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { VALUE_ROUTES_MOCK } from '../data/value-routes.mock';
import { ValueRoutesPageResponse } from '../models/value-route.model';

interface ValueRoutesQuery {
  readonly page: number;
  readonly pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ValueRoutesMockRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  listByResidue(query: ValueRoutesQuery): Observable<ValueRoutesPageResponse> {
    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = VALUE_ROUTES_MOCK.slice(startIndex, endIndex);
    const hasMore = endIndex < VALUE_ROUTES_MOCK.length;

    return of({
      items,
      total: VALUE_ROUTES_MOCK.length,
      page,
      pageSize,
      hasMore
    }).pipe(delay(this.latency + 180));
  }
}
