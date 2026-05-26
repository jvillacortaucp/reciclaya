import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-complexity-skeleton',
  standalone: true,
  templateUrl: './recommendation-complexity-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationComplexitySkeletonComponent {
  protected readonly items = [1, 2, 3, 4, 5, 6];
}
