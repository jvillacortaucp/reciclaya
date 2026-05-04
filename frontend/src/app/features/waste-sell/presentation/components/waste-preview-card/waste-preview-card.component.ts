import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideMapPin } from '@lucide/angular';
import { ListingPreviewSummary } from '../../../domain/waste-sell.models';

@Component({
  selector: 'app-waste-preview-card',
  standalone: true,
  imports: [CommonModule, LucideMapPin],
  templateUrl: './waste-preview-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WastePreviewCardComponent {
  @Input() summary: ListingPreviewSummary | null = null;
  @Input() loading = false;
}
