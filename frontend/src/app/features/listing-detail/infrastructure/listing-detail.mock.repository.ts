import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { LISTING_DETAIL_MOCK } from '../../../../assets/mocks/listing-detail.mock';
import { APP_LATENCY_MS } from '../../../core/tokens/app.tokens';
import { ListingDetailRepository } from '../domain/listing-detail.repository';
import { ListingDetailEntity } from '../domain/listing-detail.models';

@Injectable({ providedIn: 'root' })
export class ListingDetailMockRepository implements ListingDetailRepository {
  private readonly latency = inject(APP_LATENCY_MS);

  getById(id: string): Observable<ListingDetailEntity | null> {
    return of(LISTING_DETAIL_MOCK[id] ?? null).pipe(delay(this.latency));
  }
}

