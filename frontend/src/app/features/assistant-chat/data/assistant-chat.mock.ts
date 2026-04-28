import { ProductSuggestion } from '../models/assistant-chat.model';

export const ASSISTANT_CHAT_SUGGESTIONS_MOCK: readonly ProductSuggestion[] = [
  {
    id: 'product-harina-funcional',
    residueInput: 'Cáscara de mango',
    productName: 'Harina funcional',
    description: 'Harina rica en fibra para panificación y mezclas saludables.',
    sectorName: 'Sector alimentaria',
    complexity: 'medium',
    marketPotential: 'high',
    iconName: 'wheat'
  },
  {
    id: 'product-extracto-antioxidante',
    residueInput: 'Cáscara de mango',
    productName: 'Extracto antioxidante',
    description: 'Polifenoles para suplementos y formulaciones nutracéuticas.',
    sectorName: 'Sector nutracéutica',
    complexity: 'high',
    marketPotential: 'high',
    iconName: 'flask-conical'
  },
  {
    id: 'product-compost-organico',
    residueInput: 'Cáscara de mango',
    productName: 'Compost orgánico',
    description: 'Abono para regeneración de suelos en agricultura sostenible.',
    sectorName: 'Sector agricultura',
    complexity: 'low',
    marketPotential: 'medium',
    iconName: 'recycle'
  },
  {
    id: 'product-biochar-cafe',
    residueInput: 'Cascarilla de café',
    productName: 'Biochar agrícola',
    description: 'Mejora retención hídrica y captura carbono en suelos.',
    sectorName: 'Sector agricultura',
    complexity: 'medium',
    marketPotential: 'high',
    iconName: 'flame'
  },
  {
    id: 'product-ingrediente-cafe',
    residueInput: 'Cascarilla de café',
    productName: 'Fibra alimentaria café',
    description: 'Ingrediente funcional para snacks y barras nutritivas.',
    sectorName: 'Sector alimentaria',
    complexity: 'medium',
    marketPotential: 'medium',
    iconName: 'wheat'
  },
  {
    id: 'product-sustrato-uva',
    residueInput: 'Bagazo de uva',
    productName: 'Sustrato enológico',
    description: 'Base para compost premium y bioinsumos agrícolas.',
    sectorName: 'Sector agricultura',
    complexity: 'low',
    marketPotential: 'medium',
    iconName: 'sprout'
  },
  {
    id: 'product-polifenoles-uva',
    residueInput: 'Bagazo de uva',
    productName: 'Extracto de polifenoles',
    description: 'Materia prima para cosmética antioxidante.',
    sectorName: 'Sector cosmética',
    complexity: 'high',
    marketPotential: 'high',
    iconName: 'flask-conical'
  },
  {
    id: 'product-harina-palta',
    residueInput: 'Semilla de palta',
    productName: 'Harina de semilla',
    description: 'Uso en formulaciones funcionales y mezclas nutricionales.',
    sectorName: 'Sector alimentaria',
    complexity: 'high',
    marketPotential: 'medium',
    iconName: 'wheat'
  },
  {
    id: 'product-biomasa-palta',
    residueInput: 'Semilla de palta',
    productName: 'Biomasa energética',
    description: 'Aprovechamiento térmico para plantas industriales.',
    sectorName: 'Sector energía',
    complexity: 'medium',
    marketPotential: 'medium',
    iconName: 'flame'
  }
] as const;

