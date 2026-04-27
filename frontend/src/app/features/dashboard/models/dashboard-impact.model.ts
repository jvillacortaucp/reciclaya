export type DashboardPeriod = 'last_7_days' | 'current_month' | 'current_quarter' | 'current_year';

export interface ImpactKpi {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly suffix?: string;
  readonly iconName: 'package' | 'file-check' | 'shield-alert' | 'building-2';
  readonly variation: number;
  readonly comparisonLabel: string;
  readonly trend: 'up' | 'down' | 'neutral';
}

export interface ProductMatrixItem {
  readonly id: string;
  readonly productName: string;
  readonly stockQuantity: number;
  readonly soldQuantity: number;
  readonly incomeAmount: number;
  readonly currency: 'PEN';
  readonly periodLabel: string;
}

export interface QuarterlyImprovementHighlight {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly trend: 'up' | 'down' | 'neutral';
}

export interface QuarterlyImprovementScore {
  readonly score: number;
  readonly maxScore: number;
  readonly improvementPercentage: number;
  readonly previousQuarterScore: number;
  readonly statusLabel: string;
  readonly highlights: readonly QuarterlyImprovementHighlight[];
}

export interface DashboardImpactData {
  readonly period: DashboardPeriod;
  readonly kpis: readonly ImpactKpi[];
  readonly productMatrix: readonly ProductMatrixItem[];
  readonly quarterlyScore: QuarterlyImprovementScore;
}

export interface DashboardPeriodOption {
  readonly value: DashboardPeriod;
  readonly label: string;
}

