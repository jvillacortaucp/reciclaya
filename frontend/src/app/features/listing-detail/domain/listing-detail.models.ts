import { DeliveryMode, ExchangeType, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';

export interface ListingMedia {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
}

export interface QuantityVolumeData {
  readonly amount: number;
  readonly unit: 'tons' | 'kg' | 'm3';
  readonly generationFrequency: string;
}

export interface PricingData {
  readonly currency: 'USD' | 'PEN';
  readonly costPerUnit: number;
  readonly estimatedTotal: number;
  readonly negotiable: boolean;
}

export interface LogisticsData {
  readonly location: string;
  readonly deliveryMode: DeliveryMode;
  readonly exchangeType: ExchangeType;
  readonly immediateAvailability: boolean;
  readonly maxStorageTime: string;
  readonly logisticsNotes: string;
}

export interface TechnicalSpec {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface RelatedListingPreview {
  readonly id: string;
  readonly title: string;
  readonly location: string;
  readonly quantityLabel: string;
  readonly priceLabel: string;
  readonly mediaUrl: string;
}

export interface ListingDetailEntity {
  readonly id: string;
  readonly referenceCode: string;
  readonly title: string;
  readonly subtitle: string;
  readonly productType: string;
  readonly specificResidueType: string;
  readonly wasteType: ResidueType;
  readonly sector: SectorType;
  readonly status: 'available' | 'recent';
  readonly description: string;
  readonly condition: 'fresh' | 'dry' | 'wet' | 'processed';
  readonly restrictions: string;
  readonly sellerName: string;
  readonly sellerVerificationLabel: string;
  readonly media: readonly ListingMedia[];
  readonly volume: QuantityVolumeData;
  readonly pricing: PricingData;
  readonly logistics: LogisticsData;
  readonly technicalSpecs: readonly TechnicalSpec[];
  readonly relatedListings: readonly RelatedListingPreview[];
}

