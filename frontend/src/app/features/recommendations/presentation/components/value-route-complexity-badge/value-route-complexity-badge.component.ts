import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VALUE_ROUTE_COMPLEXITY_LABEL } from '../../../data/value-route.constants';
import { ValueRouteComplexity } from '../../../models/value-route.model';

@Component({
  selector: 'app-value-route-complexity-badge',
  standalone: true,
  templateUrl: './value-route-complexity-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRouteComplexityBadgeComponent {
  complexity = input.required<ValueRouteComplexity>();

  protected readonly label = computed(() => VALUE_ROUTE_COMPLEXITY_LABEL[this.complexity()]);

  protected readonly badgeClasses = computed(() => {
    if (this.complexity() === 'baja') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (this.complexity() === 'media') {
      return 'bg-indigo-100 text-indigo-700';
    }
    return 'bg-rose-100 text-rose-700';
  });
}
