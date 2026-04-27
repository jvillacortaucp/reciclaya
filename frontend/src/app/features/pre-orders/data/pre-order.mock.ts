import { PRE_ORDER_PAYMENT_METHODS } from './pre-order.constants';
import { PreOrderScreenState } from '../models/pre-order.model';

export const PRE_ORDER_SCREEN_MOCK: Record<string, PreOrderScreenState> = {
  'mk-001': {
    listing: {
      id: 'mk-001',
      title: 'Cáscara de naranja',
      productType: 'Naranja Valencia',
      specificResidue: 'Cáscara seleccionada',
      wasteType: 'organic',
      sector: 'Agrícola',
      availableQuantity: 15,
      unit: 'Ton',
      pricePerUnit: 85,
      currency: 'PEN',
      exchangeType: 'sale',
      deliveryMode: 'Entrega coordinada',
      location: 'Carretera Industrial km 4.5, Piura, Perú',
      imageUrl:
        'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?auto=format&fit=crop&w=1200&q=80',
      seller: {
        id: 'seller-001',
        name: 'AgroIndustrias del Norte S.A.C.',
        sellerType: 'company',
        contactName: 'Daniela Castillo',
        phone: '+51 987 321 445',
        email: 'ventas@agronorte.pe',
        address: 'Carretera Industrial km 4.5, Piura, Perú',
        verified: true
      }
    },
    paymentMethods: PRE_ORDER_PAYMENT_METHODS,
    defaultRequestedQuantity: 1,
    defaultPickupDate: '2026-05-20',
    defaultNotes: '',
    reserveHours: 48,
    serviceFeeRate: 0.05
  },
  'mk-002': {
    listing: {
      id: 'mk-002',
      title: 'Cascarilla de café',
      productType: 'Café pergamino',
      specificResidue: 'Cascarilla limpia',
      wasteType: 'organic',
      sector: 'Agroindustrial',
      availableQuantity: 22,
      unit: 'Ton',
      pricePerUnit: 120,
      currency: 'PEN',
      exchangeType: 'sale',
      deliveryMode: 'Recojo en planta',
      location: 'Parque Industrial Norte, Cajamarca, Perú',
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      seller: {
        id: 'seller-002',
        name: 'Café Circular SAC',
        sellerType: 'company',
        contactName: 'Rosa Paredes',
        phone: '+51 955 100 320',
        email: 'contacto@cafecircular.pe',
        address: 'Parque Industrial Norte, Cajamarca, Perú',
        verified: true
      }
    },
    paymentMethods: PRE_ORDER_PAYMENT_METHODS,
    defaultRequestedQuantity: 2,
    defaultPickupDate: '2026-05-25',
    defaultNotes: 'Requiere descarga en muelle 2.',
    reserveHours: 48,
    serviceFeeRate: 0.05
  }
};
