import { PreOrderScreenState } from '../../app/features/pre-orders/domain/pre-order-screen.models';

export const PRE_ORDER_SCREEN_MOCK: Record<string, PreOrderScreenState> = {
  'mk-001': {
    product: {
      listingId: 'mk-001',
      title: 'Cáscara de Naranja',
      residueTypeLabel: 'Orgánico',
      sectorLabel: 'Agroindustrial',
      availabilityLabel: '25.5 Ton',
      locationLabel: 'Lima, Perú',
      providerLabel: 'Cítricos del Sur S.A.C.',
      unitPrice: 18.5,
      unitLabel: 'Ton',
      totalAvailable: 25.5,
      imageUrl:
        'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80'
    },
    paymentMethods: [
      { type: 'transfer', label: 'Transferencia' },
      { type: 'credit', label: 'Tarjeta' },
      { type: 'cash', label: 'Billetera' }
    ],
    reserveHours: 48,
    defaultQuantity: 10,
    defaultDate: '2026-10-15',
    defaultNotes: '',
    selectedPaymentType: 'transfer',
    draft: {
      draftCode: 'PO-88219-L',
      syncedAtLabel: 'Sincronizado hace 2 minutos'
    },
    support: {
      title: '¿Necesitas ayuda?',
      subtitle: 'Contacta a tu asesor de cuenta para asistencia en la orden.'
    }
  }
};

