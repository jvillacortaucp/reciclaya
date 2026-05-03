import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-30 grid place-items-center bg-slate-950/45 p-4" animate.enter="fade-in" animate.leave="fade-out">
        <div class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
          <h3 class="mb-3 text-lg font-semibold">{{ title }}</h3>
          <ng-content />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() title = '';
  @Input() open = false;
}
