import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  template: `
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft card-reveal">
      <p class="text-xs uppercase tracking-wide text-slate-500">{{ label }}</p>
      <p class="mt-1 text-2xl font-semibold text-slate-900">{{ value }}</p>
      @if (deltaText) { <p class="mt-1 text-xs text-emerald-700">{{ deltaText }}</p> }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() deltaText = '';
}
