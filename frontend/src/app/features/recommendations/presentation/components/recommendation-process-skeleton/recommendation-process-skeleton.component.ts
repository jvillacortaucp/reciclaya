import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-process-skeleton',
  standalone: true,
  templateUrl: './recommendation-process-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationProcessSkeletonComponent {
  protected readonly steps = [1, 2, 3, 4];
}
