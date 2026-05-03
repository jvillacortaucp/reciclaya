export interface DashboardSummary {
  readonly metrics: readonly DashboardMetric[];
  readonly volumeSeries: readonly DashboardSeriesPoint[];
  readonly recentActivity: readonly DashboardActivity[];
}

export interface DashboardMetric {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly deltaText?: string | null;
}

export interface DashboardSeriesPoint {
  readonly label: string;
  readonly date: string;
  readonly value: number;
}

export interface DashboardActivity {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: string;
}
