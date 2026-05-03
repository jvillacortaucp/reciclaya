import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-section-header',
  standalone: true,
  template: `
    <header class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">{{ title }}</h2>
        @if (subtitle) { <p class="text-sm text-slate-500">{{ subtitle }}</p> }
      </div>
      <ng-content />
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
