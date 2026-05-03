import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DashboardImpactFacade } from './application/dashboard-impact.facade';
import { DASHBOARD_COPY } from './data/dashboard-impact.constants';
import { DashboardPeriodFilterComponent } from './presentation/components/dashboard-period-filter/dashboard-period-filter.component';
import { ExportDataButtonComponent } from './presentation/components/export-data-button/export-data-button.component';
import { ImpactKpiCardComponent } from './presentation/components/impact-kpi-card/impact-kpi-card.component';
import { ProductMatrixChartComponent } from './presentation/components/product-matrix-chart/product-matrix-chart.component';
import { ProductMatrixTableComponent } from './presentation/components/product-matrix-table/product-matrix-table.component';
import { QuarterlyImprovementScoreComponent } from './presentation/components/quarterly-improvement-score/quarterly-improvement-score.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  providers: [DashboardImpactFacade],
  imports: [
    DashboardPeriodFilterComponent,
    ExportDataButtonComponent,
    ImpactKpiCardComponent,
    ProductMatrixChartComponent,
    ProductMatrixTableComponent,
    QuarterlyImprovementScoreComponent
  ],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  private readonly facade = inject(DashboardImpactFacade);

  protected readonly copy = DASHBOARD_COPY;
  protected readonly loading = this.facade.loading;
  protected readonly period = this.facade.selectedPeriod;
  protected readonly kpis = this.facade.kpis;
  protected readonly matrix = this.facade.matrix;
  protected readonly quarterlyScore = this.facade.quarterlyScore;
  protected readonly exportMessage = this.facade.exportMessage;

  ngOnInit(): void {
    this.facade.loadInitial();
  }

  protected onPeriodChange(period: 'last_7_days' | 'current_month' | 'current_quarter' | 'current_year'): void {
    this.facade.onPeriodChange(period);
  }

  protected onExportRequested(): void {
    this.facade.exportCsv();
  }
}

