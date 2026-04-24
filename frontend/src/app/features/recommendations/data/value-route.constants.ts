import { ValueRouteComplexity, ValueRoutePotential } from '../models/value-route.model';

export const VALUE_ROUTE_TEXT = {
  title: 'Sector de valor',
  subtitle: 'Explora posibles productos y oportunidades generadas a partir de este residuo.',
  baseResidueLabel: 'Residuo base: Cáscara de mango',
  helperLabel: 'Selecciona una ruta y un producto',
  intro:
    'Explora posibles productos y oportunidades generadas a partir de este residuo. El sistema ha identificado 6 rutas óptimas basadas en viabilidad técnica.',
  suggestedProductsTitle: 'Productos sugeridos',
  summaryTitle: 'Resumen de Selección',
  summaryRouteDetails: 'Detalles de la ruta',
  targetIndustriesTitle: 'Industrias objetivo',
  insightTitle: 'Insight de valor',
  continueButton: 'Continuar análisis',
  processButton: 'Ver proceso',
  marketAnalysisLink: 'Ver análisis de mercado'
} as const;

export const VALUE_ROUTE_COMPLEXITY_LABEL: Readonly<Record<ValueRouteComplexity, string>> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta'
};

export const VALUE_ROUTE_POTENTIAL_LABEL: Readonly<Record<ValueRoutePotential, string>> = {
  medio: 'Medio',
  alto: 'Alto',
  'muy-alto': 'Muy alto'
};
