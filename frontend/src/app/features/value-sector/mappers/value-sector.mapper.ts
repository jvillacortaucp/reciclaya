import { ValueSectorRoute } from '../models/value-sector.model';
import { MarketPotential, ComplexityLevel } from '../models/value-sector.model';
import { ValorizationIdeasResponse } from '../models/value-sector-api.model';

const ROUTE_ICON_BY_NAME: Readonly<Record<string, string>> = {
  alimentaria: 'Utensils',
  nutraceutica: 'Pill',
  'nutracéutica': 'Pill',
  cosmetica: 'Sparkles',
  'cosmética': 'Sparkles',
  agricultura: 'Sprout',
  energia: 'Zap',
  energía: 'Zap',
  biomateriales: 'Package',
  packaging: 'Box',
  marketplace: 'Store',
  'quimica verde': 'FlaskConical',
  'química verde': 'FlaskConical',
  absorbentes: 'Droplets',
  construccion: 'Hammer',
  construcción: 'Hammer',
  'alimento animal': 'Beef'
};

const ROUTE_FALLBACK_DETAILS: Readonly<Record<string, { insight: string; imageUrl: string }>> = {
  alimentaria: {
    insight: 'Prioriza aplicaciones con mayor demanda en formulaciones funcionales y alimentos de valor agregado.',
    imageUrl:
      'https://images.unsplash.com/photo-1576186726115-4d51596775d1?auto=format&fit=crop&w=1200&q=80'
  },
  nutraceutica: {
    insight: 'Las rutas nutracéuticas suelen requerir mejor estandarización, pero elevan el margen comercial.',
    imageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80'
  },
  'nutracéutica': {
    insight: 'Las rutas nutracéuticas suelen requerir mejor estandarización, pero elevan el margen comercial.',
    imageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80'
  },
  cosmetica: {
    insight: 'La trazabilidad y pureza del residuo mejoran la adopción en formulaciones cosméticas.',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
  },
  'cosmética': {
    insight: 'La trazabilidad y pureza del residuo mejoran la adopción en formulaciones cosméticas.',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'
  },
  agricultura: {
    insight: 'Los derivados agrícolas mejoran salida comercial si se vinculan a necesidades de regeneración de suelos.',
    imageUrl:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80'
  },
  energia: {
    insight: 'Las rutas energéticas son más competitivas cuando el residuo tiene volumen estable y logística cercana.',
    imageUrl:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
  },
  energía: {
    insight: 'Las rutas energéticas son más competitivas cuando el residuo tiene volumen estable y logística cercana.',
    imageUrl:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
  },
  biomateriales: {
    insight: 'Los biomateriales capturan valor adicional cuando el residuo mantiene consistencia física.',
    imageUrl:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
  },
  packaging: {
    insight: 'El packaging circular se fortalece cuando puedes demostrar reducción de huella frente a alternativas tradicionales.',
    imageUrl:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80'
  },
  default: {
    insight: 'Valida calidad, volumen y continuidad del residuo para priorizar la ruta con mejor adopción comercial.',
    imageUrl:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80'
  }
};

export function mapValorizationResponseToValueSectors(
  response: ValorizationIdeasResponse
): readonly ValueSectorRoute[] {
  return response.ideas.map((idea) => {
    const normalizedRouteName = normalizeRouteKey(idea.routeName);
    const routeDetails =
      ROUTE_FALLBACK_DETAILS[normalizedRouteName] ?? ROUTE_FALLBACK_DETAILS['default'];

    return {
      id: idea.id,
      routeName: idea.routeName,
      shortDescription: idea.description,
      iconName: getIconByRouteName(idea.routeName),
      marketPotential: normalizePotential(idea.marketPotential),
      targetIndustries: idea.targetIndustries ?? [],
      products: idea.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        complexity: normalizeComplexity(product.complexity),
        marketPotential: normalizePotential(product.marketPotential),
        potentialUse: product.potentialUse ?? product.description
      })),
      insight: routeDetails.insight,
      heroImageUrl: routeDetails.imageUrl
    };
  });
}

export function normalizeComplexity(value: string): ComplexityLevel {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'high' || normalized === 'alta') {
    return 'high';
  }
  if (normalized === 'medium' || normalized === 'media') {
    return 'medium';
  }
  return 'low';
}

export function normalizePotential(value: string): MarketPotential {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'high' || normalized === 'alto') {
    return 'high';
  }
  if (normalized === 'medium' || normalized === 'medio') {
    return 'medium';
  }
  return 'low';
}

export function getIconByRouteName(routeName: string): string {
  return ROUTE_ICON_BY_NAME[normalizeRouteKey(routeName)] ?? 'Compass';
}

function normalizeRouteKey(routeName: string): string {
  return routeName.trim().toLowerCase();
}
