import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexXAxis
} from 'ng-apexcharts';
import { ChartType } from '../../../models/recommendation.model';

interface DonutChartOptions {
  readonly series: ApexNonAxisChartSeries;
  readonly chart: ApexChart;
  readonly labels: string[];
  readonly legend: ApexLegend;
  readonly stroke: ApexStroke;
  readonly dataLabels: ApexDataLabels;
  readonly plotOptions: ApexPlotOptions;
  readonly responsive: ApexResponsive[];
  readonly colors: string[];
}

interface BarChartOptions {
  readonly series: ApexAxisChartSeries;
  readonly chart: ApexChart;
  readonly xaxis: ApexXAxis;
  readonly dataLabels: ApexDataLabels;
  readonly plotOptions: ApexPlotOptions;
  readonly colors: string[];
}

@Component({
  selector: 'app-market-chart-card',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './market-chart-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketChartCardComponent {
  series = input<readonly number[]>([]);
  labels = input<readonly string[]>([]);
  chartType = input<ChartType>('donut');

  chartTypeChanged = output<ChartType>();

  protected readonly donutOptions: DonutChartOptions = {
    chart: { type: 'donut', toolbar: { show: false }, animations: { speed: 280 } },
    series: [],
    labels: [],
    legend: { position: 'bottom', fontSize: '12px' },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '76%' } } },
    responsive: [{ breakpoint: 640, options: { chart: { height: 220 } } }],
    colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
  };

  protected readonly barOptions: BarChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, animations: { speed: 280 } },
    series: [],
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '45%' } },
    colors: ['#10b981']
  };

  protected get donutSeries(): ApexNonAxisChartSeries {
    return [...this.series()];
  }

  protected get donutLabels(): string[] {
    return [...this.labels()];
  }

  protected get barSeries(): ApexAxisChartSeries {
    return [
      {
        name: 'Costo %',
        data: [...this.series()]
      }
    ];
  }

  protected get barCategories(): string[] {
    return [...this.labels()];
  }

  protected get barXAxis(): ApexXAxis {
    return { ...this.barOptions.xaxis, categories: this.barCategories };
  }
}
