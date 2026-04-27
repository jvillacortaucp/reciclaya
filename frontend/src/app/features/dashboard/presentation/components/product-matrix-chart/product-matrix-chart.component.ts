import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import { ProductMatrixItem } from '../../../models/dashboard-impact.model';

interface ProductMatrixChartOptions {
  readonly series: ApexAxisChartSeries;
  readonly chart: ApexChart;
  readonly colors: string[];
  readonly plotOptions: ApexPlotOptions;
  readonly xaxis: ApexXAxis;
  readonly yaxis: ApexYAxis | ApexYAxis[];
  readonly stroke: ApexStroke;
  readonly dataLabels: ApexDataLabels;
  readonly tooltip: ApexTooltip;
  readonly legend: ApexLegend;
}

@Component({
  selector: 'app-product-matrix-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './product-matrix-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductMatrixChartComponent {
  items = input.required<readonly ProductMatrixItem[]>();

  protected readonly chartOptions = computed<ProductMatrixChartOptions>(() => {
    const items = this.items();
    return {
      chart: {
        type: 'line',
        height: 320,
        stacked: false,
        toolbar: { show: false },
        animations: { speed: 380 }
      },
      series: [
        {
          name: 'Stock',
          type: 'column',
          data: items.map((item) => item.stockQuantity),
          yAxisIndex: 0
        },
        {
          name: 'Vendido',
          type: 'column',
          data: items.map((item) => item.soldQuantity),
          yAxisIndex: 0
        },
        {
          name: 'Ingreso (S/)',
          type: 'line',
          data: items.map((item) => item.incomeAmount),
          yAxisIndex: 1
        }
      ],
      colors: ['#0f766e', '#22c55e', '#1d4ed8'],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 0,
          columnWidth: '45%'
        }
      },
      xaxis: {
        categories: items.map((item) => item.productName),
        labels: { style: { fontSize: '11px', colors: '#475569' } }
      },
      yaxis: [
        {
          title: { text: 'Cantidad' },
          labels: { style: { colors: '#64748b' } },
          min: 0
        },
        {
          opposite: true,
          title: { text: 'Ingreso (S/)' },
          labels: { style: { colors: '#64748b' } },
          min: 0
        }
      ],
      stroke: {
        width: [0, 0, 2.5],
        curve: 'smooth'
      },
      dataLabels: { enabled: false },
      legend: { position: 'top', horizontalAlign: 'left' },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number, context?: { seriesIndex?: number }) => {
            if ((context?.seriesIndex ?? 0) === 2) {
              return `S/ ${value.toLocaleString('es-PE')}`;
            }
            return `${value}`;
          }
        }
      }
    };
  });
}

