import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-financial-skeleton',
  standalone: true,
  templateUrl: './recommendation-financial-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationFinancialSkeletonComponent {
  protected readonly kpis = [1, 2, 3];
  protected readonly steps = [1, 2, 3];
  protected readonly costRows = [1, 2, 3, 4];
}
