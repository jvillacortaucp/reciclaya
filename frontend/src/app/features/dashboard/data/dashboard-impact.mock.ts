import { DashboardImpactData, DashboardPeriod } from '../models/dashboard-impact.model';

const KPI_COMPARISON_LABEL = 'vs periodo anterior';

export const DASHBOARD_IMPACT_MOCK: Readonly<Record<DashboardPeriod, DashboardImpactData>> = {
  last_7_days: {
    period: 'last_7_days',
    kpis: [
      {
        id: 'waste-registered',
        label: 'Residuos registrados',
        value: 128,
        iconName: 'package',
        variation: 12,
        comparisonLabel: KPI_COMPARISON_LABEL,
        trend: 'up'
      },
      {
        id: 'pre-orders',
        label: 'Pre-órdenes',
        value: 34,
        iconName: 'file-check',
        variation: 8,
        comparisonLabel: KPI_COMPARISON_LABEL,
        trend: 'up'
      },
      {
        id: 'competitors',
        label: 'Competidores',
        value: 12,
        iconName: 'shield-alert',
        variation: 1,
        comparisonLabel: KPI_COMPARISON_LABEL,
        trend: 'neutral'
      },
      {
        id: 'interested-companies',
        label: 'Empresas interesadas',
        value: 48,
        iconName: 'building-2',
        variation: -4,
        comparisonLabel: KPI_COMPARISON_LABEL,
        trend: 'down'
      }
    ],
    productMatrix: [
      { id: 'mango-peel', productName: 'Cáscara de mango', stockQuantity: 22, soldQuantity: 15, incomeAmount: 5850, currency: 'PEN', periodLabel: 'Últimos 7 días' },
      { id: 'coffee-husk', productName: 'Cascarilla de café', stockQuantity: 18, soldQuantity: 12, incomeAmount: 4620, currency: 'PEN', periodLabel: 'Últimos 7 días' },
      { id: 'cocoa-pulp', productName: 'Pulpa de cacao', stockQuantity: 26, soldQuantity: 17, incomeAmount: 7990, currency: 'PEN', periodLabel: 'Últimos 7 días' },
      { id: 'avocado-seed', productName: 'Semilla de palta', stockQuantity: 14, soldQuantity: 9, incomeAmount: 3840, currency: 'PEN', periodLabel: 'Últimos 7 días' },
      { id: 'grape-bagasse', productName: 'Bagazo de uva', stockQuantity: 19, soldQuantity: 13, incomeAmount: 5210, currency: 'PEN', periodLabel: 'Últimos 7 días' }
    ],
    quarterlyScore: {
      score: 82,
      maxScore: 100,
      improvementPercentage: 18,
      previousQuarterScore: 69,
      statusLabel: 'Mejora positiva',
      highlights: [
        { id: 'reutilization', label: 'Mayor reutilización', value: '+22%', trend: 'up' },
        { id: 'income', label: 'Mayor ingreso', value: '+15%', trend: 'up' },
        { id: 'interest', label: 'Más empresas interesadas', value: '+9', trend: 'up' },
        { id: 'residue-reduction', label: 'Reducción de residuos', value: '-11%', trend: 'up' }
      ]
    }
  },
  current_month: {
    period: 'current_month',
    kpis: [
      { id: 'waste-registered', label: 'Residuos registrados', value: 356, iconName: 'package', variation: 9, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'pre-orders', label: 'Pre-órdenes', value: 102, iconName: 'file-check', variation: 6, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'competitors', label: 'Competidores', value: 15, iconName: 'shield-alert', variation: 0, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'neutral' },
      { id: 'interested-companies', label: 'Empresas interesadas', value: 129, iconName: 'building-2', variation: 13, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' }
    ],
    productMatrix: [
      { id: 'mango-peel', productName: 'Cáscara de mango', stockQuantity: 81, soldQuantity: 64, incomeAmount: 24680, currency: 'PEN', periodLabel: 'Este mes' },
      { id: 'coffee-husk', productName: 'Cascarilla de café', stockQuantity: 74, soldQuantity: 52, incomeAmount: 20850, currency: 'PEN', periodLabel: 'Este mes' },
      { id: 'cocoa-pulp', productName: 'Pulpa de cacao', stockQuantity: 90, soldQuantity: 71, incomeAmount: 29740, currency: 'PEN', periodLabel: 'Este mes' },
      { id: 'avocado-seed', productName: 'Semilla de palta', stockQuantity: 58, soldQuantity: 41, incomeAmount: 16930, currency: 'PEN', periodLabel: 'Este mes' },
      { id: 'grape-bagasse', productName: 'Bagazo de uva', stockQuantity: 69, soldQuantity: 55, incomeAmount: 22310, currency: 'PEN', periodLabel: 'Este mes' }
    ],
    quarterlyScore: {
      score: 84,
      maxScore: 100,
      improvementPercentage: 16,
      previousQuarterScore: 72,
      statusLabel: 'Mejora positiva',
      highlights: [
        { id: 'reutilization', label: 'Mayor reutilización', value: '+19%', trend: 'up' },
        { id: 'income', label: 'Mayor ingreso', value: '+14%', trend: 'up' },
        { id: 'interest', label: 'Más empresas interesadas', value: '+17', trend: 'up' },
        { id: 'residue-reduction', label: 'Reducción de residuos', value: '-13%', trend: 'up' }
      ]
    }
  },
  current_quarter: {
    period: 'current_quarter',
    kpis: [
      { id: 'waste-registered', label: 'Residuos registrados', value: 942, iconName: 'package', variation: 14, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'pre-orders', label: 'Pre-órdenes', value: 287, iconName: 'file-check', variation: 11, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'competitors', label: 'Competidores', value: 21, iconName: 'shield-alert', variation: 5, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'down' },
      { id: 'interested-companies', label: 'Empresas interesadas', value: 361, iconName: 'building-2', variation: 18, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' }
    ],
    productMatrix: [
      { id: 'mango-peel', productName: 'Cáscara de mango', stockQuantity: 226, soldQuantity: 184, incomeAmount: 73840, currency: 'PEN', periodLabel: 'Trimestre actual' },
      { id: 'coffee-husk', productName: 'Cascarilla de café', stockQuantity: 198, soldQuantity: 151, incomeAmount: 62870, currency: 'PEN', periodLabel: 'Trimestre actual' },
      { id: 'cocoa-pulp', productName: 'Pulpa de cacao', stockQuantity: 241, soldQuantity: 193, incomeAmount: 82690, currency: 'PEN', periodLabel: 'Trimestre actual' },
      { id: 'avocado-seed', productName: 'Semilla de palta', stockQuantity: 163, soldQuantity: 121, incomeAmount: 51960, currency: 'PEN', periodLabel: 'Trimestre actual' },
      { id: 'grape-bagasse', productName: 'Bagazo de uva', stockQuantity: 188, soldQuantity: 149, incomeAmount: 64220, currency: 'PEN', periodLabel: 'Trimestre actual' }
    ],
    quarterlyScore: {
      score: 88,
      maxScore: 100,
      improvementPercentage: 18,
      previousQuarterScore: 74,
      statusLabel: 'Mejora positiva',
      highlights: [
        { id: 'reutilization', label: 'Mayor reutilización', value: '+24%', trend: 'up' },
        { id: 'income', label: 'Mayor ingreso', value: '+21%', trend: 'up' },
        { id: 'interest', label: 'Más empresas interesadas', value: '+33', trend: 'up' },
        { id: 'residue-reduction', label: 'Reducción de residuos', value: '-16%', trend: 'up' }
      ]
    }
  },
  current_year: {
    period: 'current_year',
    kpis: [
      { id: 'waste-registered', label: 'Residuos registrados', value: 3820, iconName: 'package', variation: 21, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'pre-orders', label: 'Pre-órdenes', value: 1094, iconName: 'file-check', variation: 19, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' },
      { id: 'competitors', label: 'Competidores', value: 29, iconName: 'shield-alert', variation: 2, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'neutral' },
      { id: 'interested-companies', label: 'Empresas interesadas', value: 1420, iconName: 'building-2', variation: 27, comparisonLabel: KPI_COMPARISON_LABEL, trend: 'up' }
    ],
    productMatrix: [
      { id: 'mango-peel', productName: 'Cáscara de mango', stockQuantity: 933, soldQuantity: 775, incomeAmount: 312800, currency: 'PEN', periodLabel: 'Año actual' },
      { id: 'coffee-husk', productName: 'Cascarilla de café', stockQuantity: 846, soldQuantity: 703, incomeAmount: 284400, currency: 'PEN', periodLabel: 'Año actual' },
      { id: 'cocoa-pulp', productName: 'Pulpa de cacao', stockQuantity: 1007, soldQuantity: 846, incomeAmount: 358250, currency: 'PEN', periodLabel: 'Año actual' },
      { id: 'avocado-seed', productName: 'Semilla de palta', stockQuantity: 682, soldQuantity: 561, incomeAmount: 227300, currency: 'PEN', periodLabel: 'Año actual' },
      { id: 'grape-bagasse', productName: 'Bagazo de uva', stockQuantity: 781, soldQuantity: 640, incomeAmount: 269700, currency: 'PEN', periodLabel: 'Año actual' }
    ],
    quarterlyScore: {
      score: 90,
      maxScore: 100,
      improvementPercentage: 22,
      previousQuarterScore: 74,
      statusLabel: 'Mejora positiva',
      highlights: [
        { id: 'reutilization', label: 'Mayor reutilización', value: '+28%', trend: 'up' },
        { id: 'income', label: 'Mayor ingreso', value: '+24%', trend: 'up' },
        { id: 'interest', label: 'Más empresas interesadas', value: '+115', trend: 'up' },
        { id: 'residue-reduction', label: 'Reducción de residuos', value: '-19%', trend: 'up' }
      ]
    }
  }
};

