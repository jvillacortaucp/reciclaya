import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceListing } from '../../../domain/marketplace.models';

@Component({
  selector: 'app-recommended-listing-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="flex h-full min-h-[360px] min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div class="relative h-44 overflow-hidden">
        @if (primaryMedia(); as media) {
          <img [src]="media.url" [alt]="media.alt" class="h-full w-full object-cover" />
        } @else {
          <div class="grid h-full w-full place-items-center bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500">
            <span class="text-xs font-semibold uppercase tracking-[0.1em]">Sin imagen</span>
          </div>
        }
        <span class="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          Coincidencia {{ listing.matchScore }}%
        </span>
      </div>
      <div class="flex min-h-0 flex-1 flex-col p-4">
        <div class="flex items-center justify-between gap-2">
          <h4 class="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">{{ listing.specificResidue }}</h4>
          <span class="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
            {{ listing.sector === 'agroindustry' ? 'Agroindustrial' : listing.sector === 'food' ? 'Alimenticio' : listing.sector }}
          </span>
        </div>
        <p class="mt-2 truncate text-sm text-slate-600">{{ listing.quantity }} {{ listing.unit }} · {{ listing.location }}</p>
        <a [routerLink]="['/marketplace', listing.id]" class="mt-auto inline-flex w-full items-center justify-center rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
          Ver detalle
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendedListingCardComponent {
  @Input({ required: true }) listing!: MarketplaceListing;

  protected primaryMedia(): MarketplaceListing['media'][number] | null {
    return this.listing.media[0] ?? null;
  }
}
