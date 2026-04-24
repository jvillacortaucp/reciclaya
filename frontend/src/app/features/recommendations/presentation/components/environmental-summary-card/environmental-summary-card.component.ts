import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { EnvironmentalSummary } from '../../../models/recommendation.model';

@Component({
  selector: 'app-environmental-summary-card',
  standalone: true,
  imports: [LucideArrowRight],
  templateUrl: './environmental-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentalSummaryCardComponent {
  summary = input<EnvironmentalSummary | null>(null);
}
