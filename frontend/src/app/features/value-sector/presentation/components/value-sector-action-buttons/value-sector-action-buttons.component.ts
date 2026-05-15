import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LucideExternalLink, LucideEye } from '@lucide/angular';

@Component({
  selector: 'app-value-sector-action-buttons',
  standalone: true,
  imports: [LucideEye, LucideExternalLink],
  templateUrl: './value-sector-action-buttons.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorActionButtonsComponent {
  processRequested = output<void>();
  complexityRequested = output<void>();
  marketRequested = output<void>();
}
