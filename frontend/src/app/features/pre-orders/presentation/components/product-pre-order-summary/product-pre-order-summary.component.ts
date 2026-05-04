import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../../../core/constants/media.constants';
import { PreOrderListing } from '../../../models/pre-order.model';

@Component({
  selector: 'app-product-pre-order-summary',
  standalone: true,
  template: `
    @if (listing) {
      <article class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div class="grid md:grid-cols-[240px_minmax(0,1fr)]">
          <div class="relative">
            @if (!imageLoaded) {
              <div class="absolute inset-0 z-10 grid place-items-center bg-white/60">
                <img src="/loader.gif" alt="Cargando" class="w-12 h-12" />
              </div>
            }
            <img
              [src]="listing.imageUrl || fallbackImage"
              [alt]="listing.title"
              class="h-52 w-full object-cover md:h-full"
              loading="lazy"
              (load)="onImageLoad()"
              (error)="onImageError($event)"
            />
          </div>
          <div class="p-5 md:p-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <span class="rounded-lg bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {{ listing.sector }} / {{ listing.wasteType === 'organic' ? 'Orgánico' : 'Inorgánico' }}
                </span>
                <h3 class="mt-3 text-2xl font-semibold leading-tight text-slate-900 md:text-3xl">{{ listing.title }}</h3>
              </div>
              <div class="text-left md:text-right">
                <p class="text-sm text-slate-500">Precio</p>
                <p class="text-3xl font-semibold text-emerald-700 md:text-4xl">{{ currencySymbol }} {{ listing.pricePerUnit }} / {{ listing.unit }}</p>
              </div>
            </div>
            <div class="mt-5 grid gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
              <div>
                <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">Producto fuente</p>
                <p class="text-base font-medium text-slate-900 md:text-lg">{{ listing.productType }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">Disponible</p>
                <p class="text-base font-medium text-slate-900 md:text-lg">{{ listing.availableQuantity }} {{ listing.unit }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductPreOrderSummaryComponent {
  @Input({ required: true }) listing: PreOrderListing | null = null;

  protected readonly fallbackImage = FALLBACK_IMAGE_URL;

  protected imageLoaded = false;

  protected onImageLoad(): void {
    this.imageLoaded = true;
  }

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src === this.fallbackImage) return;
    img.src = this.fallbackImage;
    this.imageLoaded = true;
  }

  protected get currencySymbol(): string {
    return 'S/';
  }
}
