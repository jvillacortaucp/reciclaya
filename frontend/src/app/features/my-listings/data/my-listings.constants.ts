import { ExchangeType, ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';
import { MyListingsFilterState } from '../domain/my-listing.model';

export interface MyListingsSelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
}

export interface MyListingsTabOption {
  readonly value: 'active' | 'draft' | 'inactive';
  readonly label: string;
}

export interface FloatingActionOption {
  readonly key: 'new' | 'value-sector' | 'export' | 'marketplace';
  readonly label: string;
  readonly icon: 'plus' | 'sparkles' | 'download' | 'store';
}

export const MY_LISTINGS_COPY = {
  title: 'Mis publicaciones',
  subtitle:
    'Administra tus residuos publicados, revisa su estado y gestiona tus oportunidades.',
  valueSector: 'Recomendaciones',
  filters: 'Filtros',
  publishListing: 'Publicar residuo',
  clearFilters: 'Limpiar filtros',
  noResults: 'No se encontraron publicaciones con los filtros seleccionados.',
  noData: 'Aún no tienes publicaciones registradas.',
  deactivatedSuccess: 'Publicación desactivada correctamente.',
  restoredSuccess: 'Publicación restaurada correctamente.',
  exportedSuccess: 'Listado exportado correctamente.'
} as const;

export const MY_LISTINGS_TAB_OPTIONS: readonly MyListingsTabOption[] = [
  { value: 'active', label: 'Activas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'inactive', label: 'Desactivadas' }
];

export const MY_LISTINGS_RESIDUE_TYPE_OPTIONS: readonly MyListingsSelectOption<
  ResidueType | 'all'
>[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: ResidueType.Organic, label: 'Orgánico' },
  { value: ResidueType.Inorganic, label: 'Inorgánico' }
];

export const MY_LISTINGS_SECTOR_OPTIONS: readonly MyListingsSelectOption<SectorType | 'all'>[] = [
  { value: 'all', label: 'Todos los sectores' },
  { value: SectorType.Agriculture, label: 'Agrícola' },
  { value: SectorType.Agroindustry, label: 'Agroindustrial' },
  { value: SectorType.Food, label: 'Alimenticio' },
  { value: SectorType.Metallurgical, label: 'Metalúrgico' },
  { value: SectorType.Industrial, label: 'Manufactura' }
];

export const MY_LISTINGS_PRODUCT_OPTIONS: readonly MyListingsSelectOption<
  ProductCategory | 'all'
>[] = [
  { value: 'all', label: 'Todos los productos' },
  { value: ProductCategory.Mango, label: 'Mango' },
  { value: ProductCategory.Coffee, label: 'Café' },
  { value: ProductCategory.Cacao, label: 'Cacao' },
  { value: ProductCategory.Grape, label: 'Uva' }
];

export const MY_LISTINGS_STATUS_OPTIONS: readonly MyListingsSelectOption<
  MyListingsFilterState['status']
>[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'inactive', label: 'Desactivadas' }
];

export const MY_LISTINGS_EXCHANGE_OPTIONS: readonly MyListingsSelectOption<
  ExchangeType | 'all'
>[] = [
  { value: 'all', label: 'Venta / Trueque / Recojo' },
  { value: ExchangeType.Sale, label: 'Venta' },
  { value: ExchangeType.Barter, label: 'Trueque' },
  { value: ExchangeType.Pickup, label: 'Recojo' }
];

export const MY_LISTINGS_DEFAULT_FILTERS: MyListingsFilterState = {
  residueType: 'all',
  sector: 'all',
  productType: 'all',
  specificResidue: '',
  status: 'all',
  exchangeType: 'all',
  publishedDate: ''
};

export const MY_LISTINGS_FLOATING_ACTIONS: readonly FloatingActionOption[] = [
  { key: 'new', label: 'Nueva publicación', icon: 'plus' },
  { key: 'value-sector', label: 'Ver sector de valor', icon: 'sparkles' },
  { key: 'export', label: 'Exportar listado', icon: 'download' },
  { key: 'marketplace', label: 'Ir a Marketplace', icon: 'store' }
];
