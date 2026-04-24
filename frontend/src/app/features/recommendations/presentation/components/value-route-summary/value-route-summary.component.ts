import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideExternalLink,
  LucideEye,
  LucideInfo
} from '@lucide/angular';
import {
  VALUE_ROUTE_COMPLEXITY_LABEL,
  VALUE_ROUTE_POTENTIAL_LABEL,
  VALUE_ROUTE_TEXT
} from '../../../data/value-route.constants';
import { ValueRouteSelectionSummary } from '../../../models/value-route.model';

@Component({
  selector: 'app-value-route-summary',
  standalone: true,
  imports: [LucideInfo, LucideEye, LucideExternalLink],
  templateUrl: './value-route-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueRouteSummaryComponent {
  summary = input<ValueRouteSelectionSummary | null>(null);
  completion = input<number>(0);

  protected readonly texts = VALUE_ROUTE_TEXT;

  protected readonly potentialLabel = computed(() => {
    const selected = this.summary();
    if (!selected) {
      return '-';
    }
    return VALUE_ROUTE_POTENTIAL_LABEL[selected.potential];
  });

  protected readonly complexityLabel = computed(() => {
    const selected = this.summary();
    if (!selected) {
      return '-';
    }
    return VALUE_ROUTE_COMPLEXITY_LABEL[selected.complexity];
  });
}
