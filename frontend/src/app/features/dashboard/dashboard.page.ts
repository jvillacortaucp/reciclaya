import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexStroke, ApexXAxis } from 'ng-apexcharts';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';

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
  protected chartOptions!: ChartOptions;

  ngOnInit(): void {
    this.chartOptions = {
      chart: {
        type: 'area',
        height: 280,
        toolbar: { show: false },
        animations: { speed: 420 }
      },
      series: [{ name: 'Volumen transado (ton)', data: [12, 18, 15, 21, 26, 24, 29] }],
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] }
    };
  }
}
