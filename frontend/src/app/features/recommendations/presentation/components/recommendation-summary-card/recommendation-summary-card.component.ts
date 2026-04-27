import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideArrowRight, LucideBarChart3, LucideInfo } from '@lucide/angular';
import { RecommendationProcess } from '../../../models/recommendation.model';

@Component({
  selector: 'app-recommendation-summary-card',
  standalone: true,
  imports: [LucideBarChart3, LucideArrowRight, LucideInfo],
  templateUrl: './recommendation-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationSummaryCardComponent {
  recommendation = input<RecommendationProcess | null>(null);
  explanationRequested = output<void>();
  marketRequested = output<void>();

  protected primaryMachine(data: RecommendationProcess): string {
    return data.principalEquipment.find((item) => item.toLowerCase().includes('molino')) ?? data.principalEquipment[0] ?? '-';
  }
}
