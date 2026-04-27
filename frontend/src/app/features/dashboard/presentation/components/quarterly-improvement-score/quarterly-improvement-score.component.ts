import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideMinus, LucideTrendingDown, LucideTrendingUp } from '@lucide/angular';
import { QuarterlyImprovementScore } from '../../../models/dashboard-impact.model';

@Component({
  selector: 'app-quarterly-improvement-score',
  standalone: true,
  imports: [LucideTrendingUp, LucideTrendingDown, LucideMinus],
  templateUrl: './quarterly-improvement-score.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuarterlyImprovementScoreComponent {
  score = input.required<QuarterlyImprovementScore>();

  protected readonly scorePercent = computed(() =>
    Math.round((this.score().score / this.score().maxScore) * 100)
  );
}

