import {
  DeliveryMode,
  ExchangeType,
  ProductCategory,
  ResidueType,
  SectorType
} from '../../../core/enums/marketplace.enums';
import { SelectOption, WasteSellPageState } from '../domain/waste-sell.models';

export const WASTE_SELL_COPY = {
  title: 'Registrar residuo para venta',
  subtitle:
    'Publique residuos o subproductos disponibles para valorizacion, intercambio o recogida.',
  preview: 'Vista previa',
  publish: 'Publicar',
  statusReady: 'LISTO PARA PUBLICAR',
  helperAi: 'Proximamente: sugerencias de uso basadas en IA para mejorar valorizacion.'
} as const;

export const RESIDUE_TYPE_OPTIONS: readonly SelectOption<ResidueType>[] = [
  { value: ResidueType.Organic, label: 'Organico' },
  { value: ResidueType.Inorganic, label: 'Inorganico' }
];

export const SECTOR_OPTIONS: readonly SelectOption<SectorType>[] = [
  { value: SectorType.Agriculture, label: 'Agricultura' },
  { value: SectorType.Agroindustry, label: 'Agroindustrial' },
  { value: SectorType.Metallurgical, label: 'Metalurgico' },
  { value: SectorType.Food, label: 'Alimentos' },
  { value: SectorType.Industrial, label: 'Industrial' }
];

export const PRODUCT_TYPE_OPTIONS: readonly SelectOption<ProductCategory>[] = [
  { value: ProductCategory.Mango, label: 'Mango' },
  { value: ProductCategory.Coffee, label: 'Cafe' },
  { value: ProductCategory.Cacao, label: 'Cacao' },
  { value: ProductCategory.Grape, label: 'Uva' }
];

export const UNIT_OPTIONS: readonly SelectOption<'tons' | 'kg' | 'm3'>[] = [
  { value: 'tons', label: 'Toneladas (tons)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'm3', label: 'Metros cubicos (m3)' }
];

export const FREQUENCY_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'single', label: 'Pago unico (Lote)' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' }
];

export const EXCHANGE_TYPE_OPTIONS: readonly SelectOption<ExchangeType>[] = [
  { value: ExchangeType.Sale, label: 'Venta directa' },
  { value: ExchangeType.Barter, label: 'Trueque' },
  { value: ExchangeType.Pickup, label: 'Solo recogida' }
];

export const DELIVERY_MODE_OPTIONS: readonly SelectOption<DeliveryMode>[] = [
  { value: DeliveryMode.WarehousePickup, label: 'Comprador recoge' },
  { value: DeliveryMode.CoordinatedDelivery, label: 'Entrega coordinada' },
  { value: DeliveryMode.ThirdPartyTransport, label: 'Transporte tercero' }
];

export const STORAGE_TIME_OPTIONS: readonly SelectOption<string>[] = [
  { value: '24h', label: '24 Horas' },
  { value: '48h', label: '48 Horas' },
  { value: '72h', label: '72 Horas' },
  { value: '1w', label: '1 Semana' }
];

export const CONDITION_OPTIONS: readonly SelectOption<'fresh' | 'dry' | 'wet' | 'processed'>[] = [
  { value: 'fresh', label: 'Fresco' },
  { value: 'dry', label: 'Seco' },
  { value: 'wet', label: 'Humedo' },
  { value: 'processed', label: 'Procesado' }
];

export const WASTE_FORM_MESSAGES = {
  required: 'Este campo es obligatorio.',
  positiveNumber: 'Ingrese un valor numerico mayor a cero.',
  mediaLimit: 'Maximo 5 fotos permitidas.'
} as const;

export const EMPTY_WASTE_SELL_STATE: WasteSellPageState = {
  formValue: {
    residueType: ResidueType.Organic,
    sector: SectorType.Agriculture,
    productType: ProductCategory.Mango,
    specificResidue: '',
    shortDescription: '',
    volume: {
      quantity: 10,
      unit: 'tons',
      generationFrequency: 'single',
      estimatedCostPerUnit: 45
    },
    logistics: {
      warehouseAddress: '',
      maxStorageTime: '48h',
      exchangeType: ExchangeType.Sale,
      deliveryMode: DeliveryMode.WarehousePickup,
      immediateAvailability: true
    },
    additional: {
      condition: 'fresh',
      restrictionsNotes: '',
      nextAvailabilityDate: ''
    },
    mediaUploads: []
  },
  draftSavedAt: null,
  aiSuggestionNote: WASTE_SELL_COPY.helperAi
};
