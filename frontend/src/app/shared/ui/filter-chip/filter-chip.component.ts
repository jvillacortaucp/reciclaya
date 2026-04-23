import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-filter-chip',
  standalone: true,
  template: `
    <button type="button" class="rounded-full border px-3 py-1.5 text-xs transition"
      [class]="active ? 'border-primary-500 bg-primary-50 text-primary-700 chip-active' : 'border-slate-300 bg-white text-slate-700'">
      {{ label }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterChipComponent {
  @Input() label = '';
  @Input() active = false;
}
