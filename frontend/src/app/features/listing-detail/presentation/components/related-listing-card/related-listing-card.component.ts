import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RelatedListingPreview } from '../../../domain/listing-detail.models';

@Component({
  selector: 'app-related-listing-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img [src]="item.mediaUrl" [alt]="item.title" class="h-28 w-full object-cover" />
      <div class="space-y-2 p-3">
        <h4 class="line-clamp-2 text-base font-semibold text-slate-900">{{ item.title }}</h4>
        <p class="text-xs text-slate-500">{{ item.location }}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-600">{{ item.quantityLabel }}</span>
          <span class="font-semibold text-emerald-700">{{ item.priceLabel }}</span>
        </div>
        <a [routerLink]="['/marketplace', item.id]" class="inline-flex w-full items-center justify-center rounded-lg border border-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
          Ver detalle
        </a>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelatedListingCardComponent {
  @Input({ required: true }) item!: RelatedListingPreview;
}

