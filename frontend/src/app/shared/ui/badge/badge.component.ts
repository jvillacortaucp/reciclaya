import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `<span class="rounded-full px-2.5 py-1 text-xs font-medium" [class]="badgeClass">{{ text }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() text = '';
  @Input() status: 'success' | 'info' | 'warning' = 'info';

  get badgeClass(): string {
    const base = 'rounded-full px-2.5 py-1 text-xs font-medium';
    const statusClass = {
      success: 'bg-emerald-100 text-emerald-700',
      info: 'bg-slate-100 text-slate-700',
      warning: 'bg-amber-100 text-amber-700'
    } as const;

    return `${base} ${statusClass[this.status]}`;
  }
}
