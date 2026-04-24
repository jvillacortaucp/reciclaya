import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { VALUE_SECTOR_MOCK } from '../data/value-sector.mock';
import { ValueSectorPageResponse } from '../models/value-sector.model';

interface ValueSectorQuery {
  readonly page: number;
  readonly pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ValueSectorService {
  private readonly latency = inject(APP_LATENCY_MS);

  list(query: ValueSectorQuery): Observable<ValueSectorPageResponse> {
    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = VALUE_SECTOR_MOCK.slice(startIndex, endIndex);
    const hasMore = endIndex < VALUE_SECTOR_MOCK.length;

    return of({
      items,
      total: VALUE_SECTOR_MOCK.length,
      page,
      pageSize,
      hasMore
    }).pipe(delay(this.latency + 180));
  }
}
