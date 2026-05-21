import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardComponent } from '../../../../../../shared/ui/card/card.component';

@Component({
  selector: 'app-compliance-summary-card',
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ title }}</p>
      <p class="mt-3 text-3xl font-semibold text-slate-900">{{ value }}</p>
      @if (subtitle) {
        <p class="mt-2 text-sm text-slate-500">{{ subtitle }}</p>
      }
      @if (progress !== null) {
        <div class="mt-4 h-2 rounded-full bg-slate-100">
          <div class="h-2 rounded-full bg-emerald-500 transition-all" [style.width.%]="progress"></div>
        </div>
      }
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceSummaryCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() progress: number | null = null;
}
