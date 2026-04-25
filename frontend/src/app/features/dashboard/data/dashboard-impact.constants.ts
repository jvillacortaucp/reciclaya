import { DashboardPeriodOption } from '../models/dashboard-impact.model';

export const DASHBOARD_PERIOD_OPTIONS: readonly DashboardPeriodOption[] = [
  { value: 'last_7_days', label: 'Últimos 7 días' },
  { value: 'current_month', label: 'Este mes' },
  { value: 'current_quarter', label: 'Trimestre actual' },
  { value: 'current_year', label: 'Año actual' }
];

export const DASHBOARD_COPY = {
  title: 'Dashboard de impacto',
  subtitle: 'Monitorea residuos, pre-órdenes, demanda e ingresos generados por valorización.',
  matrixTitle: 'Matriz de productos e ingresos',
  matrixSubtitle: 'Comparativo de stock, ventas e ingresos por producto.',
  scoreTitle: 'Score de mejora trimestral',
  exportSuccess: 'Datos exportados correctamente.'
} as const;

