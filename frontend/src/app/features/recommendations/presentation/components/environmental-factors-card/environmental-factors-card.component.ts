import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAlertTriangle, LucideCheckCircle2, LucideLeaf } from '@lucide/angular';
import { EnvironmentalFactors } from '../../../models/recommendation.model';

@Component({
  selector: 'app-environmental-factors-card',
  standalone: true,
  imports: [LucideLeaf, LucideAlertTriangle, LucideCheckCircle2],
  templateUrl: './environmental-factors-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnvironmentalFactorsCardComponent {
  factors = input<EnvironmentalFactors | null>(null);
}
