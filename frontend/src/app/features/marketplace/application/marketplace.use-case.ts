import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WasteListing } from '../../../core/models/app.models';
import { MarketplaceRepository } from '../infrastructure/marketplace.repository';

@Injectable({ providedIn: 'root' })
export class MarketplaceUseCase {
  private readonly repository = inject(MarketplaceRepository);

  getListingsByQuery(query: string): Observable<readonly WasteListing[]> {
    return this.repository
      .list()
      .pipe(map((items) => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))));
  }
}
