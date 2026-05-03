import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  template: `
    <section class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
      <p class="mt-1 text-sm text-slate-500">{{ description }}</p>
      <div class="mt-4"><ng-content /></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
}
