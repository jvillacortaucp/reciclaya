import { DeliveryMode, ExchangeType, ResidueType, SectorType } from '../../app/core/enums/marketplace.enums';
import { ListingDetailEntity } from '../../app/features/listing-detail/domain/listing-detail.models';

export const LISTING_DETAIL_MOCK: Record<string, ListingDetailEntity> = {
  'mk-001': {
    id: 'mk-001',
    referenceCode: 'EV-450-CIT-2023',
    title: 'Residuo Industrial de Naranja (Cáscara y Pulpa)',
    subtitle: 'Lote 450B - Cítricos',
    productType: 'Cítricos',
    specificResidueType: 'Cáscara y Pulpa',
    wasteType: ResidueType.Organic,
    sector: SectorType.Agroindustry,
    status: 'available',
    description:
      'Lote homogenizado proveniente de procesamiento de jugos en frío. Alta concentración de aceites esenciales y fibra soluble, ideal para valorización energética o bioplásticos.',
    condition: 'fresh',
    restrictions:
      'Este material es altamente fermentable. Requiere transporte hermético para evitar lixiviados y disposición final certificada.',
    sellerName: 'Frutícola Industrial S.A.',
    sellerVerificationLabel: 'Empresa certificada',
    media: [
      {
        id: 'l1',
        url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80',
        alt: 'Contenedor industrial con residuos cítricos'
      },
      {
        id: 'l2',
        url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=900&q=80',
        alt: 'Detalle de cáscara de naranja'
      },
      {
        id: 'l3',
        url: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b2a?auto=format&fit=crop&w=900&q=80',
        alt: 'Planta industrial'
      }
    ],
    volume: {
      amount: 25.5,
      unit: 'tons',
      generationFrequency: 'Lote único'
    },
    pricing: {
      currency: 'USD',
      costPerUnit: 18.5,
      estimatedTotal: 471.75,
      negotiable: false
    },
    logistics: {
      location: 'Planta Norte, Zona Industrial, Lima, Perú',
      deliveryMode: DeliveryMode.WarehousePickup,
      exchangeType: ExchangeType.Sale,
      immediateAvailability: true,
      maxStorageTime: '48 horas',
      logisticsNotes: 'Carga disponible en tolva/cisterna. Requiere cita previa para carga.'
    },
    technicalSpecs: [
      { key: 'humidity', label: 'Humedad', value: '72.4%' },
      { key: 'ph', label: 'pH promedio', value: '3.8' },
      { key: 'organic', label: 'Contenido orgánico', value: '98.1%' },
      { key: 'impurities', label: 'Impurezas', value: '< 0.5%' },
      { key: 'oils', label: 'Aceites esc.', value: '1.2 kg/t' },
      { key: 'temp', label: 'Temp. carga', value: '18°C' }
    ],
    relatedListings: [
      {
        id: 'mk-002',
        title: 'Pulpa de Mango',
        location: 'Cali, VAC',
        quantityLabel: '8 Ton',
        priceLabel: '$85 / Ton',
        mediaUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'mk-005',
        title: 'Cáscara de Arroz Limpia',
        location: 'Neiva, HUI',
        quantityLabel: '120 Ton',
        priceLabel: 'Gratis',
        mediaUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'mk-007',
        title: 'Aserrín de Pino Seco',
        location: 'Envigado, ANT',
        quantityLabel: '5 Ton',
        priceLabel: 'Canjeable',
        mediaUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=900&q=80'
      }
    ]
  }
};

