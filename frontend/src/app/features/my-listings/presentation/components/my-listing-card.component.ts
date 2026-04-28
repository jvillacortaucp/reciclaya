import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEye, LucidePencil, LucideSparkles } from '@lucide/angular';
import { MyListing } from '../../domain/my-listing.model';

@Component({
  selector: 'app-my-listing-card',
  standalone: true,
  imports: [RouterLink, LucideEye, LucidePencil, LucideSparkles],
  template: `
    <article
      role="button"
      tabindex="0"
      class="flex h-full min-h-[430px] min-w-0 flex-col overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      [class.border-emerald-500]="isSelected"
      [class.ring-4]="isSelected"
      [class.ring-emerald-500]="isSelected"
      [class.ring-inset]="isSelected"
      [attr.data-tour]="tourTarget ? 'first-listing-card' : null"
      (click)="selectCard()"
      (keydown.enter)="selectCard()"
      (keydown.space)="selectCard(); $event.preventDefault()">
      <div class="relative h-52 overflow-hidden rounded-t-3xl bg-slate-200">
        @if (listing.imageUrl) {
          <img [src]="listing.imageUrl" [alt]="listing.specificResidue" class="h-full w-full object-cover" />
        } @else {
          <div class="grid h-full w-full place-items-center bg-linear-to-br from-slate-200 to-slate-300 text-slate-500">
            <span class="text-xs font-semibold uppercase tracking-[0.1em]">Sin imagen</span>
          </div>
        }
        <span class="absolute left-3 top-3 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
          Activo
        </span>
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-4">
        <div class="mb-2 flex flex-wrap gap-2">
          <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-700">
            {{ listing.sector === 'agriculture' ? 'Agrícola' : listing.sector === 'agroindustry' ? 'Agroindustrial' : listing.sector === 'food' ? 'Alimenticio' : listing.sector === 'metallurgical' ? 'Metalúrgico' : 'Manufactura' }}
          </span>
          <span class="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase text-amber-700">
            {{ listing.residueType === 'organic' ? 'Orgánico' : 'Inorgánico' }}
          </span>
        </div>

        <h3 class="line-clamp-2 text-2xl font-medium leading-tight text-slate-900">{{ listing.title }}</h3>
        <p class="line-clamp-1 text-sm text-slate-500">{{ listing.specificResidue }}</p>

        <div class="mt-4 grid gap-1 text-sm">
          <p class="text-slate-600">
            <span class="text-slate-500">Cantidad:</span>
            <strong class="ml-1 text-slate-900">{{ listing.quantity }} {{ listing.unitLabel }}</strong>
          </p>
          <p class="text-slate-600">
            <span class="text-slate-500">Precio:</span>
            <strong class="ml-1 text-emerald-700">{{ listing.estimatedPriceLabel }}</strong>
          </p>
          <p class="text-slate-600">
            <span class="text-slate-500">Intercambio:</span>
            <strong class="ml-1 text-slate-900">{{ listing.exchangeLabel }}</strong>
          </p>
          <p class="text-xs text-slate-400">Publicado: {{ listing.publishedAt }}</p>
        </div>

        <div class="mt-2 border-t border-slate-200 pt-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <a
              [routerLink]="['/marketplace', listing.id]"
              class="inline-flex items-center gap-1 text-base font-semibold text-emerald-700 transition hover:text-emerald-800"
              (click)="$event.stopPropagation()"
            >
              <svg lucideEye size="15"></svg>
              Ver detalle
            </a>
          </div>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyListingCardComponent {
  @Input({ required: true }) listing!: MyListing;
  @Input() tourTarget = false;
  @Input() isSelected = false;
  @Output() readonly selected = new EventEmitter<string>();
  @Output() readonly recommendations = new EventEmitter<string>();
  @Output() readonly edit = new EventEmitter<string>();

  protected selectCard(): void {
    this.selected.emit(this.listing.id);
  }
}
