import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `<article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"><ng-content /></article>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {}
