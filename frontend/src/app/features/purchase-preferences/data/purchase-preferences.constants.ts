import { ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';
import {
  AcceptedExchangeType,
  MaterialCondition,
  PreferredMode,
  PriorityLevel,
  PurchaseFrequency,
  PurchaseUnit,
  SelectOption
} from '../domain/purchase-preferences.models';

export const PURCHASE_PREFERENCES_COPY = {
  title: 'Preferencias de compra',
  subtitle:
    'Define qué residuos o subproductos deseas comprar para recibir coincidencias y oportunidades.',
  savePreference: 'Guardar preferencia',
  preview: 'Preview',
  activateAlert: 'Activar alerta',
  aiPlaceholder:
    'Próximamente: motor inteligente para sugerir proveedores y residuos alternativos con mayor afinidad.'
} as const;

export const RESIDUE_TYPE_OPTIONS: readonly SelectOption<ResidueType>[] = [
  { value: ResidueType.Organic, label: 'Orgánico' },
  { value: ResidueType.Inorganic, label: 'Inorgánico' }
];

export const SECTOR_OPTIONS: readonly SelectOption<SectorType>[] = [
  { value: SectorType.Agriculture, label: 'Agrícola' },
  { value: SectorType.Agroindustry, label: 'Agroindustrial' },
  { value: SectorType.Metallurgical, label: 'Metalúrgico' },
  { value: SectorType.Food, label: 'Alimentos' },
  { value: SectorType.Industrial, label: 'Industrial' }
];

export const PRODUCT_TYPE_OPTIONS: readonly SelectOption<ProductCategory>[] = [
  { value: ProductCategory.Mango, label: 'Mango' },
  { value: ProductCategory.Coffee, label: 'Café' },
  { value: ProductCategory.Cacao, label: 'Cacao' },
  { value: ProductCategory.Grape, label: 'Uva' }
];

export const SPECIFIC_RESIDUE_OPTIONS: readonly string[] = [
  'Cáscara',
  'Pulpa',
  'Semilla',
  'Bagazo',
  'Retazos',
  'Aserrín',
  'Descartes de proceso'
];

export const UNIT_OPTIONS: readonly SelectOption<PurchaseUnit>[] = [
  { value: 'tons', label: 'Toneladas (t)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'm3', label: 'Metros cúbicos (m3)' }
];

export const PURCHASE_FREQUENCY_OPTIONS: readonly SelectOption<PurchaseFrequency>[] = [
  { value: 'one_time', label: 'Única compra' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'recurring', label: 'Recurrente' }
];

export const CONDITION_OPTIONS: readonly SelectOption<MaterialCondition>[] = [
  { value: 'fresh', label: 'Fresco' },
  { value: 'dry', label: 'Seco' },
  { value: 'wet', label: 'Húmedo' },
  { value: 'processed', label: 'Procesado' }
];

export const PREFERRED_MODE_OPTIONS: readonly SelectOption<PreferredMode>[] = [
  { value: 'pickup', label: 'Recojo por mi parte' },
  { value: 'coordinated_delivery', label: 'Entrega coordinada' },
  { value: 'either', label: 'Cualquiera' }
];

export const ACCEPTED_EXCHANGE_OPTIONS: readonly SelectOption<AcceptedExchangeType>[] = [
  { value: 'purchase', label: 'Compra monetaria' },
  { value: 'barter', label: 'Trueque' },
  { value: 'either', label: 'Cualquiera' }
];

export const PRIORITY_OPTIONS: readonly SelectOption<PriorityLevel>[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Urgente' }
];

export const RADIUS_RANGE = {
  min: 5,
  max: 150
} as const;

export const PURCHASE_PREFERENCES_MESSAGES = {
  required: 'Este campo es obligatorio.',
  positiveNumber: 'Ingrese un valor mayor a cero.',
  invalidRange: 'El rango máximo debe ser mayor o igual al mínimo.',
  saved: 'Preferencia guardada correctamente.',
  activated: 'Alerta activada. Te notificaremos coincidencias en tiempo real.'
} as const;
