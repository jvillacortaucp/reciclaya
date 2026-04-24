import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePackage } from '@lucide/angular';
import { MarketplaceListing } from '../../../domain/marketplace.models';

@Component({
  selector: 'app-marketplace-product-card',
  standalone: true,
  imports: [RouterLink, LucidePackage],
  template: `
    <article class="flex h-full min-h-490px min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div class="relative h-62 overflow-hidden bg-slate-200">
        @if (primaryMedia(); as media) {
          <img [src]="media.url" [alt]="media.alt" class="h-full w-full object-cover" />
        } @else {
          <div class="grid h-full w-full place-items-center bg-linear-to-br from-slate-200 to-slate-300 text-slate-500">
            <span class="text-xs font-semibold uppercase tracking-0.1em">Sin imagen</span>
          </div>
        }
        @if (listing.matchScore > 80) {
          <span class="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            Coincidencia {{ listing.matchScore }}%
          </span>
        }
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-4">
        <div class="flex items-center justify-between gap-2">
          <span class="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
            {{ listing.wasteType === 'organic' ? 'Orgánico' : 'Inorgánico' }}
          </span>
          <span class="shrink-0 text-sm font-semibold text-slate-800">
            @if (listing.pricePerUnitUsd === null) { Negociable } @else { USD {{ listing.pricePerUnitUsd }}/t }
          </span>
        </div>
        <h3 class="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-slate-900">{{ listing.specificResidue }}</h3>
        <p class="truncate text-sm text-slate-500">{{ listing.location }}</p>
        <div class="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <svg lucidePackage size="14"></svg>
          <span class="truncate">{{ listing.quantity }} {{ listing.unit }}</span>
          <span class="ml-auto rounded-lg bg-slate-100 px-2 py-0.5 text-xs">{{ listing.exchangeType === 'barter' ? 'Trueque' : listing.exchangeType === 'pickup' ? 'Recojo' : 'Venta' }}</span>
        </div>
        <a
          [routerLink]="['/app/marketplace', listing.id]"
          class="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Ver detalle
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceProductCardComponent {
  @Input({ required: true }) listing!: MarketplaceListing;

  protected primaryMedia(): MarketplaceListing['media'][number] | null {
    return this.listing.media[0] ?? null;
  }
}
