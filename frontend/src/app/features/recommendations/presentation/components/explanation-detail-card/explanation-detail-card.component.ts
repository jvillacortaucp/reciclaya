import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../../../../core/constants/media.constants';
import { LucideAlertTriangle, LucideEye, LucideLightbulb, LucideTarget } from '@lucide/angular';
import { ExplanationStep } from '../../../models/recommendation.model';

@Component({
  selector: 'app-explanation-detail-card',
  standalone: true,
  imports: [LucideEye, LucideLightbulb, LucideAlertTriangle, LucideTarget],
  templateUrl: './explanation-detail-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplanationDetailCardComponent {
  step = input<ExplanationStep | null>(null);
  protected readonly fallbackImage = FALLBACK_IMAGE_URL;
}
