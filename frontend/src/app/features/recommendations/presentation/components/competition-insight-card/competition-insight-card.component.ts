import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAlertTriangle } from '@lucide/angular';
import { CompetitionInsight } from '../../../models/recommendation.model';

@Component({
  selector: 'app-competition-insight-card',
  standalone: true,
  imports: [LucideAlertTriangle],
  templateUrl: './competition-insight-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetitionInsightCardComponent {
  insight = input<CompetitionInsight | null>(null);
}

