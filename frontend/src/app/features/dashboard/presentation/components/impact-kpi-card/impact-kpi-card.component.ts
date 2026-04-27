import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideBuilding2,
  LucideFileCheck2,
  LucideMinus,
  LucidePackage,
  LucideShieldAlert,
  LucideTrendingDown,
  LucideTrendingUp
} from '@lucide/angular';
import { ImpactKpi } from '../../../models/dashboard-impact.model';

@Component({
  selector: 'app-impact-kpi-card',
  standalone: true,
  imports: [
    LucidePackage,
    LucideFileCheck2,
    LucideShieldAlert,
    LucideBuilding2,
    LucideTrendingUp,
    LucideTrendingDown,
    LucideMinus
  ],
  templateUrl: './impact-kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImpactKpiCardComponent {
  kpi = input.required<ImpactKpi>();

  protected readonly trendClasses = computed(() => {
    const trend = this.kpi().trend;
    if (trend === 'up') return 'text-emerald-700 bg-emerald-100';
    if (trend === 'down') return 'text-rose-700 bg-rose-100';
    return 'text-amber-700 bg-amber-100';
  });
}

