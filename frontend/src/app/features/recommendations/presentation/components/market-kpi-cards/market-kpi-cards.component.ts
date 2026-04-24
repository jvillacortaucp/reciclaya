import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideShieldCheck, LucideTrendingUp, LucideUsers } from '@lucide/angular';
import { MarketKpi } from '../../../models/recommendation.model';

@Component({
  selector: 'app-market-kpi-cards',
  standalone: true,
  imports: [LucideTrendingUp, LucideUsers, LucideShieldCheck],
  templateUrl: './market-kpi-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketKpiCardsComponent {
  kpis = input<readonly MarketKpi[]>([]);

  protected trackByKpi(_: number, item: MarketKpi): string {
    return item.id;
  }

  protected toneClass(tone: MarketKpi['tone']): string {
    if (tone === 'emerald') return 'text-emerald-700 bg-emerald-50';
    if (tone === 'amber') return 'text-amber-700 bg-amber-50';
    return 'text-slate-700 bg-slate-100';
  }

  protected progressClass(tone: MarketKpi['tone']): string {
    if (tone === 'emerald') return 'bg-emerald-500';
    if (tone === 'amber') return 'bg-amber-500';
    return 'bg-slate-500';
  }
}

