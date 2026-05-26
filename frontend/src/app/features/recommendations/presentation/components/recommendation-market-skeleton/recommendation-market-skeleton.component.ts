import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-market-skeleton',
  standalone: true,
  templateUrl: './recommendation-market-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationMarketSkeletonComponent {
  protected readonly buyers = [1, 2, 3];
}
