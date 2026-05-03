import {
  DeliveryMode,
  ExchangeType,
  ProductCategory,
  ResidueType,
  SectorType
} from '../../../core/enums/marketplace.enums';

export interface SelectOption<TValue extends string> {
  readonly value: TValue;
  readonly label: string;
  readonly helper?: string;
}

export interface WasteVolumeData {
  readonly quantity: number;
  readonly unit: 'tons' | 'kg' | 'm3';
  readonly generationFrequency: string;
  readonly estimatedCostPerUnit: number;
}

export interface WasteLogisticsData {
  readonly warehouseAddress: string;
  readonly maxStorageTime: string;
  readonly exchangeType: ExchangeType;
  readonly deliveryMode: DeliveryMode;
  readonly immediateAvailability: boolean;
}

export interface WasteMediaUpload {
  readonly id: string;
  readonly name: string;
  readonly previewUrl: string;
  readonly sizeKb: number;
  readonly type: string;
  readonly mediaId?: string | null;
  readonly uploadStatus?: 'pending' | 'uploading' | 'uploaded' | 'failed';
  readonly warningMessage?: string | null;
}

export interface WasteAdditionalData {
  readonly condition: 'fresh' | 'dry' | 'wet' | 'processed';
  readonly restrictionsNotes: string;
  readonly nextAvailabilityDate: string;
}

export interface WasteListingFormValue {
  readonly residueType: ResidueType;
  readonly sector: SectorType;
  readonly productType: ProductCategory;
  readonly specificResidue: string;
  readonly shortDescription: string;
  readonly volume: WasteVolumeData;
  readonly logistics: WasteLogisticsData;
  readonly additional: WasteAdditionalData;
  readonly mediaUploads: readonly WasteMediaUpload[];
}

export interface ListingPreviewSummary {
  readonly title: string;
  readonly residueTypeLabel: string;
  readonly sectorLabel: string;
  readonly volumeLabel: string;
  readonly estimatedValueLabel: string;
  readonly locationLabel: string;
  readonly availabilityLabel: string;
  readonly statusLabel: 'BORRADOR' | 'LISTO PARA PUBLICAR';
  readonly completionPercentage: number;
}

export interface WasteSellPageState {
  readonly formValue: WasteListingFormValue;
  readonly draftSavedAt: string | null;
  readonly aiSuggestionNote: string;
}
