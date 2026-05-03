import { ProductSuggestion } from '../models/assistant-chat.model';

export const ASSISTANT_CHAT_SUGGESTIONS_MOCK: readonly ProductSuggestion[] = [
  {
    id: 'mango-flour',
    residueInput: 'Cáscara de mango',
    productName: 'Harina funcional',
    description: 'Ingrediente rico en fibra para panificación y mezclas alimentarias.',
    sectorName: 'Sector Alimentaria',
    complexity: 'medium',
    marketPotential: 'high',
    iconName: 'shell'
  },
  {
    id: 'mango-extract',
    residueInput: 'Cáscara de mango',
    productName: 'Extracto antioxidante',
    description: 'Base natural para suplementos y formulaciones cosméticas.',
    sectorName: 'Sector Nutracéutica',
    complexity: 'high',
    marketPotential: 'high',
    iconName: 'flask-conical'
  },
  {
    id: 'mango-compost',
    residueInput: 'Cáscara de mango',
    productName: 'Compost orgánico',
    description: 'Abono para regeneración de suelos y agricultura circular.',
    sectorName: 'Sector Agricultura',
    complexity: 'low',
    marketPotential: 'medium',
    iconName: 'recycle'
  },
  {
    id: 'coffee-substrate',
    residueInput: 'Cascarilla de café',
    productName: 'Sustrato agrícola',
    description: 'Mezcla orgánica para viveros y producción hortícola.',
    sectorName: 'Sector Agricultura',
    complexity: 'low',
    marketPotential: 'high',
    iconName: 'leaf'
  },
  {
    id: 'grape-biomass',
    residueInput: 'Bagazo de uva',
    productName: 'Biomasa para compost',
    description: 'Valorización orgánica para compostaje y enmiendas de suelo.',
    sectorName: 'Sector Agricultura',
    complexity: 'medium',
    marketPotential: 'medium',
    iconName: 'flame'
  },
  {
    id: 'avocado-oil-base',
    residueInput: 'Semilla de palta',
    productName: 'Base para bioinsumo',
    description: 'Materia prima para procesos de extracción y transformación.',
    sectorName: 'Sector Manufactura',
    complexity: 'high',
    marketPotential: 'medium',
    iconName: 'factory'
  }
] as const;
