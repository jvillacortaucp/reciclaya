import { DeliveryMode, ExchangeType, ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';
import { MarketplaceFilterState, SortOption } from '../domain/marketplace.models';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export const MARKETPLACE_COPY = {
  title: 'Marketplace',
  subtitle: 'Encuentra residuos y subproductos disponibles para compra, trueque o recojo',
  saveSearch: 'Guardar búsqueda',
  clearFilters: 'Limpiar filtros',
  publishListing: 'Publicar residuo'
} as const;

export const WASTE_TYPE_FILTER_OPTIONS: readonly SelectOption<ResidueType | 'all'>[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: ResidueType.Organic, label: 'Orgánico' },
  { value: ResidueType.Inorganic, label: 'Inorgánico' }
];

export const SECTOR_FILTER_OPTIONS: readonly SelectOption<SectorType | 'all'>[] = [
  { value: 'all', label: 'Todos los sectores' },
  { value: SectorType.Agriculture, label: 'Agrícola' },
  { value: SectorType.Agroindustry, label: 'Agroindustrial' },
  { value: SectorType.Food, label: 'Alimenticio' },
  { value: SectorType.Metallurgical, label: 'Metalúrgico' },
  { value: SectorType.Industrial, label: 'Industrial' }
];

export const PRODUCT_FILTER_OPTIONS: readonly SelectOption<ProductCategory | 'all'>[] = [
  { value: 'all', label: 'Todos los productos' },
  { value: ProductCategory.Mango, label: 'Mango' },
  { value: ProductCategory.Coffee, label: 'Café' },
  { value: ProductCategory.Cacao, label: 'Cacao' },
  { value: ProductCategory.Grape, label: 'Uva' }
];

export const EXCHANGE_FILTER_OPTIONS: readonly SelectOption<ExchangeType | 'all'>[] = [
  { value: 'all', label: 'Cualquiera' },
  { value: ExchangeType.Sale, label: 'Venta' },
  { value: ExchangeType.Barter, label: 'Trueque' },
  { value: ExchangeType.Pickup, label: 'Recojo' }
];

export const DELIVERY_FILTER_OPTIONS: readonly SelectOption<DeliveryMode | 'all'>[] = [
  { value: 'all', label: 'Todas las modalidades' },
  { value: DeliveryMode.WarehousePickup, label: 'Recojo en almacén' },
  { value: DeliveryMode.CoordinatedDelivery, label: 'Entrega coordinada' },
  { value: DeliveryMode.ThirdPartyTransport, label: 'Transporte tercero' }
];

export const CONDITION_FILTER_OPTIONS: readonly SelectOption<
  MarketplaceFilterState['residueCondition']
>[] = [
  { value: 'all', label: 'Todas las condiciones' },
  { value: 'fresh', label: 'Fresco' },
  { value: 'dry', label: 'Seco' },
  { value: 'wet', label: 'Húmedo' },
  { value: 'processed', label: 'Procesado' }
];

export const SORT_OPTIONS: readonly SelectOption<SortOption>[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'best_match', label: 'Mejor match' },
  { value: 'lowest_price', label: 'Menor precio' },
  { value: 'highest_volume', label: 'Mayor volumen' }
];

export const DEFAULT_FILTER_STATE: MarketplaceFilterState = {
  wasteType: 'all',
  sector: 'all',
  productType: 'all',
  specificResidue: '',
  exchangeType: 'all',
  location: '',
  minPrice: null,
  maxPrice: null,
  deliveryMode: 'all',
  immediateOnly: false,
  residueCondition: 'all'
};

export const MARKETPLACE_MESSAGES = {
  savedSearch: 'Búsqueda guardada en tus accesos rápidos.',
  noResults: 'No encontramos resultados con estos filtros. Ajusta criterios para ampliar coincidencias.',
  noData: 'Aún no hay residuos disponibles.'
} as const;

