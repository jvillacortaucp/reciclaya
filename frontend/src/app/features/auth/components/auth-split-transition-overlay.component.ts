import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthTransitionService } from '../services/auth-transition.service';

@Component({
  selector: 'app-auth-split-transition-overlay',
  standalone: true,
  template: `
    @if (isPlaying()) {
      <div class="pointer-events-none fixed inset-0 z-[120] overflow-hidden bg-[#f1f3f8]">
        <div
          class="absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px] transition-opacity"
          [style.transition-duration.ms]="finishDuration"
          [class.opacity-100]="phase() !== 'finishing'"
          [class.opacity-0]="phase() === 'finishing'"></div>

        <div
          class="absolute inset-y-0 left-0 w-1/2 bg-linear-to-br from-[#0f2a38] via-[#102a43] to-[#113247] transition-transform ease-[cubic-bezier(0.19,0.82,0.28,1)]"
          [style.transition-duration.ms]="openDuration"
          [class.-translate-x-[110%]]="isOpenPhase()"
          [class.opacity-0]="phase() === 'finishing'">
        </div>

        <div
          class="absolute inset-y-0 right-0 w-1/2 bg-linear-to-b from-white to-slate-50 transition-transform ease-[cubic-bezier(0.19,0.82,0.28,1)]"
          [style.transition-duration.ms]="openDuration"
          [class.translate-x-[110%]]="isOpenPhase()"
          [class.opacity-0]="phase() === 'finishing'">
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthSplitTransitionOverlayComponent {
  private readonly transition = inject(AuthTransitionService);

  protected readonly isPlaying = this.transition.isPlaying;
  protected readonly phase = this.transition.phase;
  protected readonly openDuration = this.transition.OPEN_DURATION_MS;
  protected readonly finishDuration = this.transition.FINISH_FADE_MS;
  protected readonly isOpenPhase = computed(() => {
    const value = this.phase();
    return value === 'opening' || value === 'navigating' || value === 'finishing';
  });
}
