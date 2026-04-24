import { ComplexityLevel, MarketPotential } from '../models/value-sector.model';

export const VALUE_SECTOR_TEXT = {
  title: 'Sector de valor',
  subtitle: 'Explora posibles productos y oportunidades generadas a partir de este residuo.',
  baseResidueLabel: 'Residuo base: Cáscara de mango',
  helperLabel: 'Selecciona una ruta y un producto',
  secondaryHint: 'Selecciona una ruta y un producto para continuar con el análisis.',
  suggestedProductsTitle: 'Productos sugeridos',
  summaryTitle: 'Resumen de Selección',
  targetIndustriesTitle: 'Industrias objetivo',
  insightTitle: 'Recomendación rápida',
  continueButton: 'Continuar',
  processButton: 'Ver proceso',
  marketAnalysisLink: 'Ver análisis de mercado',
  loadMoreMessage: 'Cargando más sectores...',
  noMoreMessage: 'No hay más sectores por mostrar.'
} as const;

export const VALUE_SECTOR_COMPLEXITY_LABEL: Readonly<Record<ComplexityLevel, string>> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta'
};

export const VALUE_SECTOR_COMPLEXITY_STYLES: Readonly<Record<ComplexityLevel, string>> = {
  low: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  high: 'bg-rose-100 text-rose-700 border border-rose-200'
};

export const VALUE_SECTOR_POTENTIAL_LABEL: Readonly<Record<MarketPotential, string>> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto'
};

export const VALUE_SECTOR_POTENTIAL_STYLES: Readonly<Record<MarketPotential, string>> = {
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
  medium: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  high: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
};
