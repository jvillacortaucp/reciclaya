import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { ProductMatrixItem } from '../../../models/dashboard-impact.model';

interface ProductMatrixChartOptions {
  readonly series: ApexAxisChartSeries;
  readonly chart: ApexChart;
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
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        animations: { speed: 380 }
      },
      series: [
        { name: 'Stock', type: 'column', data: items.map((item) => item.stockQuantity) },
        { name: 'Vendido', type: 'column', data: items.map((item) => item.soldQuantity) },
        { name: 'Ingreso (S/)', type: 'line', data: items.map((item) => item.incomeAmount) }
      ],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '44%'
        }
      },
      xaxis: {
        categories: items.map((item) => item.productName),
        labels: { style: { fontSize: '11px', colors: '#475569' } }
      },
      yaxis: [
        { title: { text: 'Cantidad' }, labels: { style: { colors: '#64748b' } } },
        { opposite: true, title: { text: 'Ingreso (PEN)' }, labels: { style: { colors: '#64748b' } } }
      ],
      stroke: {
        width: [0, 0, 3],
        curve: 'smooth'
      },
      dataLabels: { enabled: false },
      legend: { position: 'top', horizontalAlign: 'left' },
      tooltip: { shared: true, intersect: false }
    };
  });
}

