import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ListingDetail, WasteListing } from '../../../core/models/app.models';
import { MarketplaceRepository } from '../infrastructure/marketplace.repository';

@Injectable({ providedIn: 'root' })
export class MarketplaceFacade {
  private readonly repository = inject(MarketplaceRepository);

  readonly loading = signal(false);
  readonly listings = signal<readonly WasteListing[]>([]);
  readonly selectedDetail = signal<ListingDetail | null>(null);

  loadListings(): void {
    this.loading.set(true);
    this.repository
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.listings.set(data));
  }

  loadDetail(id: string): void {
    this.loading.set(true);
    this.repository
      .detail(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.selectedDetail.set(data));
  }
}
