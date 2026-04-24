import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideExternalLink, LucideEye } from '@lucide/angular';
import {
  VALUE_SECTOR_COMPLEXITY_LABEL,
  VALUE_SECTOR_COMPLEXITY_STYLES,
  VALUE_SECTOR_POTENTIAL_LABEL,
  VALUE_SECTOR_POTENTIAL_STYLES,
  VALUE_SECTOR_TEXT
} from '../../../data/value-sector.constants';
import { ValueSectorSelectionSummary } from '../../../models/value-sector.model';

@Component({
  selector: 'app-value-sector-summary',
  standalone: true,
  imports: [LucideEye, LucideExternalLink],
  templateUrl: './value-sector-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorSummaryComponent {
  summary = input<ValueSectorSelectionSummary | null>(null);
  completion = input<number>(0);

  protected readonly texts = VALUE_SECTOR_TEXT;
  protected readonly complexityStyles = VALUE_SECTOR_COMPLEXITY_STYLES;
  protected readonly potentialStyles = VALUE_SECTOR_POTENTIAL_STYLES;

  protected readonly potentialLabel = computed(() => {
    const selected = this.summary();
    if (!selected) return '-';
    return VALUE_SECTOR_POTENTIAL_LABEL[selected.potential];
  });

  protected readonly complexityLabel = computed(() => {
    const selected = this.summary();
    if (!selected) return '-';
    return VALUE_SECTOR_COMPLEXITY_LABEL[selected.complexity];
  });
}
