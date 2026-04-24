import { ProductCategory, ResidueType, SectorType } from '../../app/core/enums/marketplace.enums';
import { PurchasePreferencesPageState } from '../../app/features/purchase-preferences/domain/purchase-preferences.models';

export const PURCHASE_PREFERENCES_INITIAL_STATE_MOCK: PurchasePreferencesPageState = {
  formValue: {
    desiredResidue: {
      residueType: ResidueType.Organic,
      sector: SectorType.Agroindustry,
      productType: ProductCategory.Mango,
      specificResidue: 'Cáscara de mango'
    },
    sourcing: {
      requiredVolume: 25,
      unit: 'tons',
      purchaseFrequency: 'weekly',
      minPriceUsd: 120,
      maxPriceUsd: 240,
      desiredCondition: 'fresh'
    },
    logistics: {
      receivingLocation: 'Planta Industrial Norte, CDMX',
      radiusKm: 50,
      preferredMode: 'pickup',
      acceptedExchangeType: 'purchase'
    },
    alerts: {
      notes: 'Humedad menor al 12%, libre de plásticos y con trazabilidad de lote.',
      alertOnMatch: true,
      priority: 'medium'
    }
  },
  profileStatus: {
    completionPercentage: 75,
    title: 'Configuración avanzada',
    subtitle: 'Casi listo para publicar',
    recommendation: 'Completa la sección de logística para mejorar la precisión del motor de emparejamiento.'
  },
  projection: {
    suppliersCount: 12,
    directMatchCount: 3,
    potentialMatchCount: 9,
    projectedSavingsLabel: 'CO2 2.4 ton/mes'
  },
  smartRecommendationNote:
    'Sugerencia inicial: activar alerta urgente cuando el rango de precio sea crítico para asegurar disponibilidad.',
  draftSavedAt: null
};

