import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/45 p-4"
        animate.enter="fade-in"
        animate.leave="fade-out"
      >
        <div class="grid min-h-full place-items-center">
          <div class="w-full rounded-2xl bg-white p-5 shadow-xl" [class]="panelClass()">
          <h3 class="mb-3 text-lg font-semibold">{{ title }}</h3>
          <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() title = '';
  @Input() open = false;
  @Input() size: 'md' | 'lg' | 'xl' | 'preview' = 'md';

  protected panelClass(): string {
    const sizeClass = (() => {
      switch (this.size) {
        case 'lg':
          return 'max-w-3xl';
        case 'xl':
          return 'max-w-4xl';
        case 'preview':
          return 'max-w-5xl';
        default:
          return 'max-w-lg';
      }
    })();

    return `${sizeClass} max-h-[calc(100dvh-2rem)] overflow-y-auto`;
  }
}
