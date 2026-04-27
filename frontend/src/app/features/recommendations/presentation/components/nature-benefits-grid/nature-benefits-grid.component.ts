import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideBadgeCheck,
  LucideLeaf,
  LucideRecycle,
  LucideShieldAlert,
  LucideSparkles,
  LucideTrendingUp
} from '@lucide/angular';

@Component({
  selector: 'app-nature-benefits-grid',
  standalone: true,
  imports: [LucideRecycle, LucideLeaf, LucideSparkles, LucideBadgeCheck, LucideShieldAlert, LucideTrendingUp],
  templateUrl: './nature-benefits-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NatureBenefitsGridComponent {
  benefits = input.required<readonly string[]>();
}
