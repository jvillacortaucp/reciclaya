import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideChevronRight, LucideMoveLeft } from '@lucide/angular';

@Component({
  selector: 'app-detail-breadcrumb',
  standalone: true,
  imports: [LucideChevronRight, LucideMoveLeft],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="inline-flex items-center gap-2 text-sm text-slate-500">
        <button type="button" class="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800" (click)="back.emit()">
          <svg lucideMoveLeft size="14"></svg>
          Volver
        </button>
        <svg lucideChevronRight size="14"></svg>
        <span>{{ parent }}</span>
        <svg lucideChevronRight size="14"></svg>
        <span class="font-medium text-slate-700">{{ current }}</span>
      </div>
      <span class="text-sm text-slate-400">{{ reference }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailBreadcrumbComponent {
  @Input() parent = 'Marketplace';
  @Input() current = 'Listing Detail';
  @Input() reference = '';
  @Output() readonly back = new EventEmitter<void>();
}

