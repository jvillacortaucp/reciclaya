import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'app-marketplace-pagination',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight],
  template: `
    <div class="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40"
        [disabled]="currentPage <= 1"
        (click)="pageChange.emit(currentPage - 1)"
      >
        <svg lucideChevronLeft size="16"></svg>
      </button>
      @for (page of pageNumbers(); track page) {
        <button
          type="button"
          class="inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold"
          [class.bg-emerald-600]="page === currentPage"
          [class.text-white]="page === currentPage"
          [class.bg-white]="page !== currentPage"
          [class.text-slate-700]="page !== currentPage"
          [class.border]="page !== currentPage"
          [class.border-slate-200]="page !== currentPage"
          (click)="pageChange.emit(page)"
        >
          {{ page }}
        </button>
      }
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-40"
        [disabled]="currentPage >= totalPages"
        (click)="pageChange.emit(currentPage + 1)"
      >
        <svg lucideChevronRight size="16"></svg>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplacePaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() readonly pageChange = new EventEmitter<number>();

  protected pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, idx) => idx + 1);
  }
}

