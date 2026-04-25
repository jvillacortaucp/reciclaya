import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LucideDownload } from '@lucide/angular';

@Component({
  selector: 'app-export-data-button',
  standalone: true,
  imports: [LucideDownload],
  templateUrl: './export-data-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportDataButtonComponent {
  exportRequested = output<void>();
}

