import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DASHBOARD_COPY } from '../data/dashboard-impact.constants';
import { DashboardImpactService } from '../infrastructure/dashboard-impact.service';
import { DashboardImpactData, DashboardPeriod, ProductMatrixItem } from '../models/dashboard-impact.model';

@Injectable()
export class DashboardImpactFacade {
  private readonly service = inject(DashboardImpactService);

  readonly selectedPeriod = signal<DashboardPeriod>('current_month');
  readonly loading = signal(false);
  readonly data = signal<DashboardImpactData | null>(null);
  readonly exportMessage = signal<string | null>(null);

  readonly kpis = computed(() => this.data()?.kpis ?? []);
  readonly matrix = computed(() => this.data()?.productMatrix ?? []);
  readonly quarterlyScore = computed(() => this.data()?.quarterlyScore ?? null);

  loadInitial(): void {
    this.loadByPeriod(this.selectedPeriod());
  }

  onPeriodChange(period: DashboardPeriod): void {
    if (this.selectedPeriod() === period) return;
    this.selectedPeriod.set(period);
    this.loadByPeriod(period);
  }

  exportCsv(): void {
    const rows = this.matrix();
    if (!rows.length) return;

    const headers = ['Producto', 'Stock', 'Vendido', 'Ingreso (PEN)', 'Periodo'];
    const csvRows = rows.map((item) =>
      [item.productName, item.stockQuantity, item.soldQuantity, item.incomeAmount, item.periodLabel]
        .map((value) => this.escapeCsvValue(value))
        .join(',')
    );

    const csv = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-impacto-${this.selectedPeriod()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.exportMessage.set(DASHBOARD_COPY.exportSuccess);
    window.setTimeout(() => this.exportMessage.set(null), 2600);
  }

  private loadByPeriod(period: DashboardPeriod): void {
    this.loading.set(true);
    this.service
      .getImpactData(period)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((payload) => this.data.set(payload));
  }

  private escapeCsvValue(value: string | number): string {
    const stringValue = String(value).replaceAll('"', '""');
    return `"${stringValue}"`;
  }
}

