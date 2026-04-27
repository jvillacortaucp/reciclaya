import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { CardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { MarketplaceListing } from '../marketplace/domain/marketplace.models';
import { MarketplaceProductCardComponent } from '../marketplace/presentation/components/marketplace-product-card/marketplace-product-card.component';
import { MyListingsRepository } from './my-listings.repository';

@Component({
  selector: 'app-my-listings-page',
  imports: [SectionHeaderComponent, CardComponent, EmptyStateComponent, MarketplaceProductCardComponent],
  template: `
    <ui-section-header title="Mis publicaciones" subtitle="Gestiona lotes y estado de tus anuncios" />

    @if (loading()) {
      <ui-card>
        <p class="text-sm text-slate-600">Cargando publicaciones...</p>
      </ui-card>
    } @else if (errorMessage()) {
      <ui-card>
        <p class="text-sm text-rose-600">{{ errorMessage() }}</p>
      </ui-card>
    } @else if (listings().length === 0) {
      <ui-empty-state
        title="Sin publicaciones"
        description="Aun no tienes publicaciones guardadas o publicadas."
      />
    } @else {
      <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (listing of listings(); track listing.id) {
          <app-marketplace-product-card [listing]="listing" />
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyListingsPageComponent implements OnInit {
  private readonly repository = inject(MyListingsRepository);

  protected readonly loading = signal(false);
  protected readonly listings = signal<readonly MarketplaceListing[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.repository
      .getMyListings()
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudieron cargar tus publicaciones.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((listings) => this.listings.set(listings));
  }
}
