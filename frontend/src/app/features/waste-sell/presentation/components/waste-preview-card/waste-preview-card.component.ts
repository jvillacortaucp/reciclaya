import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LucideEye, LucideMapPin } from '@lucide/angular';
import { ListingPreviewSummary } from '../../../domain/waste-sell.models';

@Component({
  selector: 'app-waste-preview-card',
  imports: [LucideMapPin, LucideEye],
  templateUrl: './waste-preview-card.component.html',
  styleUrl: './waste-preview-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WastePreviewCardComponent {
  @Input() summary: ListingPreviewSummary | null = null;
  @Input() loading = false;
}
