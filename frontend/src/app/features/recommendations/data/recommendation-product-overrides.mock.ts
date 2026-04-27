import { ComplexityLevel, MarketPotentialLevel } from '../models/recommendation.model';

export interface RecommendationProductOverride {
  readonly recommendedProduct: string;
  readonly complexity: ComplexityLevel;
  readonly marketPotential: MarketPotentialLevel;
  readonly totalEstimatedTime: string;
  readonly approximateCost: string;
  readonly expectedOutcome: string;
  readonly useCase: string;
  readonly suggestedFormat: string;
  readonly suggestedPricePerKg: number;
  readonly opportunityTag: string;
}

export const RECOMMENDATION_PRODUCT_OVERRIDES: Readonly<Record<string, RecommendationProductOverride>> = {
  'harina-funcional': {
    recommendedProduct: 'Harina funcional de cáscara de mango',
    complexity: 'medium',
    marketPotential: 'high',
    totalEstimatedTime: '18-24 horas',
    approximateCost: '$420 por lote piloto',
    expectedOutcome: 'Harina funcional estable para panificación saludable y snacks de alto valor.',
    useCase: 'Repostería y panificación saludable',
    suggestedFormat: 'Saco 25kg / Retail 500g',
    suggestedPricePerKg: 4.5,
    opportunityTag: 'Opportunity: High'
  },
  'snacks-saludables': {
    recommendedProduct: 'Base para snacks saludables de cáscara de mango',
    complexity: 'low',
    marketPotential: 'medium',
    totalEstimatedTime: '12-16 horas',
    approximateCost: '$300 por lote piloto',
    expectedOutcome: 'Mezcla deshidratada para snacks horneados con perfil alto en fibra.',
    useCase: 'Snacks horneados funcionales',
    suggestedFormat: 'Bolsas 10kg / Retail 80g',
    suggestedPricePerKg: 5.1,
    opportunityTag: 'Opportunity: Medium'
  },
  'fibra-alimentaria': {
    recommendedProduct: 'Concentrado de fibra alimentaria de mango',
    complexity: 'medium',
    marketPotential: 'high',
    totalEstimatedTime: '16-22 horas',
    approximateCost: '$390 por lote piloto',
    expectedOutcome: 'Concentrado de fibra listo para fortificación de alimentos procesados.',
    useCase: 'Fortificación de alimentos procesados',
    suggestedFormat: 'Saco 20kg / B2B',
    suggestedPricePerKg: 4.9,
    opportunityTag: 'Opportunity: High'
  },
  'capsulas-fibra': {
    recommendedProduct: 'Cápsulas de fibra de cáscara de mango',
    complexity: 'high',
    marketPotential: 'high',
    totalEstimatedTime: '24-36 horas',
    approximateCost: '$640 por lote piloto',
    expectedOutcome: 'Lote encapsulado para canal nutracéutico con trazabilidad completa.',
    useCase: 'Suplementación digestiva premium',
    suggestedFormat: 'Frasco 60 cápsulas / Retail',
    suggestedPricePerKg: 9.8,
    opportunityTag: 'Opportunity: High'
  },
  'compost-premium': {
    recommendedProduct: 'Compost premium de residuo de mango',
    complexity: 'low',
    marketPotential: 'medium',
    totalEstimatedTime: '10-14 días',
    approximateCost: '$180 por lote base',
    expectedOutcome: 'Compost estabilizado para agricultura regenerativa.',
    useCase: 'Programas de suelo regenerativo',
    suggestedFormat: 'Saco 40kg / Agrícola',
    suggestedPricePerKg: 0.9,
    opportunityTag: 'Opportunity: Medium'
  }
};

