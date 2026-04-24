import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ListingMedia } from '../../../domain/listing-detail.models';

@Component({
  selector: 'app-listing-image-gallery',
  standalone: true,
  template: `
    @if (activeMedia) {
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px]">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
          <img [src]="activeMedia.url" [alt]="activeMedia.alt" class="h-[420px] w-full object-cover" />
        </div>
        <div class="grid gap-3">
          @for (item of media; track item.id) {
            <button
              type="button"
              class="overflow-hidden rounded-2xl border transition"
              [class.border-emerald-500]="item.id === activeMedia.id"
              [class.border-slate-200]="item.id !== activeMedia.id"
              (click)="select.emit(item.id)"
            >
              <img [src]="item.url" [alt]="item.alt" class="h-[132px] w-full object-cover" />
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingImageGalleryComponent {
  @Input() media: readonly ListingMedia[] = [];
  @Input() activeMedia: ListingMedia | null = null;
  @Output() readonly select = new EventEmitter<string>();
}

