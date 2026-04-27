import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
}
