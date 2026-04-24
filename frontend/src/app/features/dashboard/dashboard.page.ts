import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexStroke, ApexXAxis } from 'ng-apexcharts';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { DashboardFacade } from './application/dashboard.facade';

interface ChartOptions {
  readonly series: ApexAxisChartSeries;
  readonly chart: ApexChart;
  readonly stroke: ApexStroke;
  readonly xaxis: ApexXAxis;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [NgApexchartsModule, SectionHeaderComponent, StatCardComponent],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  private readonly facade = inject(DashboardFacade);

  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;
  protected readonly metrics = this.facade.metrics;
  protected readonly recentActivity = this.facade.recentActivity;
  protected readonly chartOptions = computed<ChartOptions>(() => ({
    chart: {
      type: 'area',
      height: 280,
      toolbar: { show: false },
      animations: { speed: 420 }
    },
    series: [
      {
        name: 'Publicaciones nuevas',
        data: this.facade.volumeSeries().map((point) => point.value)
      }
    ],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: this.facade.volumeSeries().map((point) => point.label) }
  }));

  ngOnInit(): void {
    this.facade.loadSummary();
  }
}
