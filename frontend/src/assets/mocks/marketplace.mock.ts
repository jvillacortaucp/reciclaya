import {
  ListingDetail,
  PreOrder,
  PurchasePreference,
  Recommendation,
  WasteListing
} from '../../app/core/models/app.models';

export const WASTE_LISTINGS_MOCK: readonly WasteListing[] = [
  {
    id: 'wl-001',
    title: 'PET transparente molido',
    category: 'Plastico',
    description: 'Material limpio y listo para reprocesamiento.',
    pricePerUnit: 1.2,
    currency: 'USD',
    volume: { amount: 1200, unit: 'kg' },
    sellerName: 'EcoPolimeros SAC',
    createdAt: '2026-04-15',
    tags: ['PET', 'limpio', 'industrial']
  },
  {
    id: 'wl-002',
    title: 'Bagazo de cafe seco',
    category: 'Organico',
    description: 'Ideal para compost y biomateriales.',
    pricePerUnit: 0.45,
    currency: 'USD',
    volume: { amount: 900, unit: 'kg' },
    sellerName: 'BioAndes Foods',
    createdAt: '2026-04-16',
    tags: ['compost', 'organico', 'agro']
  },
  {
    id: 'wl-003',
    title: 'Retazos de algodon textil',
    category: 'Textil',
    description: 'Retazos clasificados por color y composicion.',
    pricePerUnit: 0.8,
    currency: 'USD',
    volume: { amount: 2.4, unit: 'ton' },
    sellerName: 'Hilados del Sur',
    createdAt: '2026-04-17',
    tags: ['algodon', 'textil', 'upcycling']
  }
];

export const LISTING_DETAIL_MOCK: Record<string, ListingDetail> = {
  'wl-001': {
    ...WASTE_LISTINGS_MOCK[0],
    qualityNotes: 'Humedad menor al 2%, sin contaminantes visibles.',
    logistics: {
      pickupAvailable: true,
      location: 'Lurin, Lima',
      deliveryWindowDays: 4
    },
    images: ['/assets/images/pet-1.jpg', '/assets/images/pet-2.jpg']
  },
  'wl-002': {
    ...WASTE_LISTINGS_MOCK[1],
    qualityNotes: 'Secado mecanico, tamiz medio.',
    logistics: {
      pickupAvailable: false,
      location: 'Ate, Lima',
      deliveryWindowDays: 6
    },
    images: ['/assets/images/coffee-1.jpg']
  },
  'wl-003': {
    ...WASTE_LISTINGS_MOCK[2],
    qualityNotes: 'Separado por lotes y composicion.',
    logistics: {
      pickupAvailable: true,
      location: 'Arequipa',
      deliveryWindowDays: 5
    },
    images: ['/assets/images/textile-1.jpg']
  }
};

export const PURCHASE_PREFERENCES_MOCK: readonly PurchasePreference[] = [
  {
    id: 'pref-001',
    material: 'PET',
    monthlyDemand: { amount: 3, unit: 'ton' },
    maxBudget: 4500,
    location: 'Lima'
  }
];

export const PRE_ORDERS_MOCK: readonly PreOrder[] = [
  {
    id: 'po-001',
    listingId: 'wl-001',
    buyerId: 'usr-001',
    quantity: 600,
    desiredDate: '2026-05-02',
    status: 'submitted',
    paymentMethod: { type: 'transfer', label: 'Transferencia bancaria' },
    pricing: {
      subtotal: 720,
      logisticsFee: 85,
      taxes: 144.9,
      total: 949.9,
      currency: 'USD'
    }
  }
];

export const RECOMMENDATIONS_MOCK: readonly Recommendation[] = [
  {
    id: 'rec-001',
    listingId: 'wl-001',
    title: 'PET de alta disponibilidad con distancia corta',
    confidenceScore: 91,
    reason: 'Coincide con tu preferencia de PET y ventana logistica < 5 dias.'
  },
  {
    id: 'rec-002',
    listingId: 'wl-003',
    title: 'Retazos de algodon para linea de upcycling',
    confidenceScore: 78,
    reason: 'Compatible con patrones historicos de compra textil.'
  }
];
