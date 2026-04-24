import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceListing } from '../../../domain/marketplace.models';

@Component({
  selector: 'app-recommended-listing-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div class="relative h-44 overflow-hidden">
        <img [src]="listing.media[0]?.url" [alt]="listing.media[0]?.alt" class="h-full w-full object-cover" />
        <span class="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          Coincidencia {{ listing.matchScore }}%
        </span>
      </div>
      <div class="space-y-2 p-4">
        <div class="flex items-center justify-between gap-2">
          <h4 class="text-2xl font-semibold text-slate-900">{{ listing.specificResidue }}</h4>
          <span class="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
            {{ listing.sector === 'agroindustry' ? 'Agroindustrial' : listing.sector === 'food' ? 'Alimenticio' : listing.sector }}
          </span>
        </div>
        <p class="text-sm text-slate-600">{{ listing.quantity }} {{ listing.unit }} · {{ listing.location }}</p>
        <a [routerLink]="['/app/marketplace', listing.id]" class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
          Ver detalle
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendedListingCardComponent {
  @Input({ required: true }) listing!: MarketplaceListing;
}

