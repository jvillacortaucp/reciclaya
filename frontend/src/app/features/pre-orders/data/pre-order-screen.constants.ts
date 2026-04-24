import { PaymentMethod } from '../../../core/models/app.models';

export const PRE_ORDER_SCREEN_COPY = {
  title: 'Pre-orden de compra',
  breadcrumbMarketplace: 'Marketplace',
  breadcrumbDetail: 'Detalle',
  breadcrumbCurrent: 'Pre-orden',
  back: 'Volver',
  saveDraft: 'Guardar borrador',
  orderConfig: 'Configuración de pedido',
  qtyLabel: 'Cantidad necesitada',
  etaLabel: 'Fecha estimada de recepción',
  reserveLabel: 'Reservar cantidad',
  providerNotesLabel: 'Observaciones para el proveedor',
  paymentMethodTitle: 'Método de pago preferido',
  economicSummaryTitle: 'Resumen económico',
  simulatePayment: 'Simular pago',
  downloadQuote: 'Descargar cotización (PDF)'
} as const;

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod['type'], string>> = {
  transfer: 'Transferencia',
  cash: 'Contraentrega',
  credit: 'Tarjeta'
};

export const PAYMENT_METHOD_ICONS: Readonly<Record<PaymentMethod['type'], 'landmark' | 'credit-card' | 'wallet'>> = {
  transfer: 'landmark',
  credit: 'credit-card',
  cash: 'wallet'
};

