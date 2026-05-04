import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../../../core/constants/media.constants';
import { RouterLink } from '@angular/router';
import { RelatedListingPreview } from '../../../domain/listing-detail.models';

@Component({
  selector: 'app-related-listing-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="relative">
        @if (!imageLoaded) {
          <div class="absolute inset-0 z-10 grid place-items-center bg-white/60">
            <img src="/loader.gif" alt="Cargando" class="w-10 h-10" />
          </div>
        }
        <img [src]="item.mediaUrl || fallbackImage" [alt]="item.title" class="h-32 w-full object-cover md:h-36" loading="lazy" (load)="onImageLoad()" (error)="onImageError($event)" />
      </div>
      <div class="flex flex-1 flex-col space-y-2 p-3 md:p-4">
        <h4 class="line-clamp-1 text-base font-bold text-slate-900">{{ item.title }}</h4>
        <p class="line-clamp-1 text-sm text-slate-500">{{ item.location }}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-600">{{ item.quantityLabel }}</span>
          <span class="font-semibold text-emerald-700">{{ toSolesLabel(item.priceLabel) }}</span>
        </div>
        <a [routerLink]="['/marketplace', item.id]" class="mt-auto inline-flex h-9 w-full items-center justify-center rounded-lg border border-emerald-500 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
          Ver detalle
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedListingCardComponent {
  @Input({ required: true }) item!: RelatedListingPreview;

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

  protected toSolesLabel(value: string): string {
    return value.replaceAll('USD', 'S/').replaceAll('$', 'S/');
  }
}

