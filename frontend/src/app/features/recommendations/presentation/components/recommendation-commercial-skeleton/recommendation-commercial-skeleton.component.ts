import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-commercial-skeleton',
  standalone: true,
  templateUrl: './recommendation-commercial-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationCommercialSkeletonComponent {
  protected readonly cards = [1, 2, 3, 4];
}
