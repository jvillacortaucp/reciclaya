import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../../../core/constants/media.constants';
import { LucideCircleDollarSign } from '@lucide/angular';
import { FinishedProductMarketCard } from '../../../models/recommendation.model';

@Component({
  selector: 'app-finished-product-card',
  standalone: true,
  imports: [DecimalPipe, LucideCircleDollarSign],
  templateUrl: './finished-product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedProductCardComponent {
  product = input<FinishedProductMarketCard | null>(null);
  protected readonly fallbackImage = FALLBACK_IMAGE_URL;

  protected onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }
}
