import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center w-full" role="status">
      <div class="inline-flex flex-col items-center gap-3">
        <img src="/loader.gif" [ngClass]="sizeClass" alt="Cargando" />
        <p *ngIf="message" class="text-sm text-slate-600">{{ message }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent {
  @Input() message?: string | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  protected get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-28 h-28';
      default:
        return 'w-12 h-12';
    }
  }
}
