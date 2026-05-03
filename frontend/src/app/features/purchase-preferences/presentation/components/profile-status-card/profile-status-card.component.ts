import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProfileStatus } from '../../../domain/purchase-preferences.models';

@Component({
  selector: 'app-profile-status-card',
  standalone: true,
  template: `
    <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <p class="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Estado del perfil</p>
      <div class="mt-4 flex items-start gap-3">
        <div class="grid h-14 w-14 place-items-center rounded-full p-1" [style.background]="gaugeBackground()">
          <div class="grid h-full w-full place-items-center rounded-full bg-slate-50 text-sm font-semibold text-slate-700">
            {{ status?.completionPercentage ?? 0 }}%
          </div>
        </div>
        <div class="min-w-0">
          <p class="truncate text-base font-semibold leading-tight text-slate-800">{{ status?.title }}</p>
          <p class="text-sm text-slate-500">{{ status?.subtitle }}</p>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <span
              class="block h-full rounded-full bg-emerald-500"
              [style.width.%]="status?.completionPercentage ?? 0"
            ></span>
          </div>
        </div>
      </div>
      <p class="mt-3 text-sm italic text-slate-500">{{ status?.recommendation }}</p>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileStatusCardComponent {
  @Input() status: ProfileStatus | null = null;

  protected gaugeBackground(): string {
    const completion = this.status?.completionPercentage ?? 0;
    return `conic-gradient(#10b981 ${completion * 3.6}deg, #e2e8f0 ${completion * 3.6}deg 360deg)`;
  }
}
