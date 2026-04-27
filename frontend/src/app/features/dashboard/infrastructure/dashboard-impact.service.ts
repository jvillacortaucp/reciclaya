import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DashboardHttpRepository } from './dashboard-http.repository';
import { DashboardSummary } from '../domain/dashboard.models';
import {
  DashboardImpactData,
  DashboardPeriod,
  ImpactKpi,
  ProductMatrixItem,
  QuarterlyImprovementScore
} from '../models/dashboard-impact.model';

@Injectable({ providedIn: 'root' })
export class DashboardImpactService {
  private readonly repository = inject(DashboardHttpRepository);

  getImpactData(period: DashboardPeriod): Observable<DashboardImpactData> {
    return this.repository.getSummary().pipe(map((summary) => this.toImpactData(summary, period)));
  }

  private toImpactData(summary: DashboardSummary, period: DashboardPeriod): DashboardImpactData {
    const kpis = this.toKpis(summary);
    const matrix = this.toMatrix(summary, period);
    const quarterlyScore = this.toQuarterlyScore(summary);

    return {
      period,
      kpis,
      productMatrix: matrix,
      quarterlyScore
    };
  }

  private toKpis(summary: DashboardSummary): readonly ImpactKpi[] {
    return summary.metrics.slice(0, 4).map((metric, index) => ({
      id: metric.key,
      label: metric.label,
      value: this.toNumericValue(metric.value),
      suffix: this.detectSuffix(metric.value),
      iconName: this.iconByIndex(index),
      variation: this.extractVariation(metric.deltaText),
      comparisonLabel: metric.deltaText ?? 'Sin comparacion disponible',
      trend: this.trendFromDelta(metric.deltaText)
    }));
  }

  private toMatrix(summary: DashboardSummary, period: DashboardPeriod): readonly ProductMatrixItem[] {
    return summary.volumeSeries.map((point, index) => ({
      id: `${point.date}-${index}`,
      productName: point.label,
      stockQuantity: Math.round(point.value),
      soldQuantity: Math.round(point.value * 0.72),
      incomeAmount: Math.round(point.value * 18.5),
      currency: 'PEN',
      periodLabel: this.periodLabel(period)
    }));
  }

  private toQuarterlyScore(summary: DashboardSummary): QuarterlyImprovementScore {
    const totalVolume = summary.volumeSeries.reduce((acc, point) => acc + point.value, 0);
    const activityCount = summary.recentActivity.length;
    const score = Math.min(100, Math.round(totalVolume / Math.max(summary.volumeSeries.length, 1)));

    return {
      score,
      maxScore: 100,
      improvementPercentage: this.extractVariation(summary.metrics[0]?.deltaText),
      previousQuarterScore: Math.max(0, score - 8),
      statusLabel: score >= 70 ? 'Buen rendimiento' : 'En progreso',
      highlights: [
        {
          id: 'volume',
          label: 'Volumen procesado',
          value: `${Math.round(totalVolume)}`,
          trend: 'up'
        },
        {
          id: 'activity',
          label: 'Actividad reciente',
          value: `${activityCount}`,
          trend: activityCount > 0 ? 'up' : 'neutral'
        },
        {
          id: 'signals',
          label: 'Metricas activas',
          value: `${summary.metrics.length}`,
          trend: summary.metrics.length > 0 ? 'up' : 'neutral'
        }
      ]
    };
  }

  private toNumericValue(value: string): number {
    const normalized = value.replace(/[^\d.,-]/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private detectSuffix(value: string): string | undefined {
    if (value.includes('%')) return '%';
    if (value.toUpperCase().includes('PEN')) return 'PEN';
    if (value.toUpperCase().includes('KG')) return 'kg';
    if (value.toUpperCase().includes('TON')) return 'ton';
    return undefined;
  }

  private extractVariation(value?: string | null): number {
    if (!value) return 0;
    const match = value.match(/-?\d+(?:[.,]\d+)?/);
    if (!match) return 0;
    return Number(match[0].replace(',', '.'));
  }

  private trendFromDelta(value?: string | null): 'up' | 'down' | 'neutral' {
    const delta = this.extractVariation(value);
    if (delta > 0) return 'up';
    if (delta < 0) return 'down';
    return 'neutral';
  }

  private iconByIndex(index: number): ImpactKpi['iconName'] {
    const icons: readonly ImpactKpi['iconName'][] = ['package', 'file-check', 'building-2', 'shield-alert'];
    return icons[index] ?? 'package';
  }

  private periodLabel(period: DashboardPeriod): string {
    switch (period) {
      case 'last_7_days':
        return 'Ultimos 7 dias';
      case 'current_quarter':
        return 'Trimestre actual';
      case 'current_year':
        return 'Ano actual';
      default:
        return 'Mes actual';
    }
  }
}

