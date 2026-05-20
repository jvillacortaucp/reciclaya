import { PaymentMethod } from '../models/pre-order.model';

export const PRE_ORDER_COPY = {
  breadcrumbMarketplace: 'Marketplace',
  breadcrumbDetail: 'Detalle del residuo',
  breadcrumbCurrent: 'Orden',
  title: 'Generar Orden',
  subtitle: 'Revisa el residuo seleccionado, define la cantidad y simula el pago.',
  sellerCardTitle: 'Proveedor',
  configureTitle: 'Configurar compra',
  paymentTitle: 'Método de pago',
  summaryTitle: 'Resumen de la Orden',
  payButton: 'Pagar y generar Orden',
  infoButton: 'Solicitar información',
  reserveLabel: 'Deseo separar esta cantidad temporalmente (reserva por 48h)',
  impactTitle: 'Impacto Ambiental',
  impactDescription:
    'Al recuperar este material, estás evitando emisiones y acelerando la valorización circular.',
  successMessage: 'Orden generada correctamente.',
  failureMessage: 'No se pudo completar la simulación de pago. Intente nuevamente.',
  processingMessage: 'Procesando pago simulado...'
} as const;

export const PRE_ORDER_PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: 'card',
    label: 'Tarjeta',
    description: 'Pago inmediato con tarjeta empresarial.',
    iconName: 'credit-card',
    enabled: true
  },
  {
    id: 'bank_transfer',
    label: 'Transferencia',
    description: 'Transferencia bancaria con validación comercial.',
    iconName: 'landmark',
    enabled: true
  },
  {
    id: 'digital_wallet',
    label: 'Yape / Plin',
    description: 'Billetera digital para montos rápidos.',
    iconName: 'qr-code',
    enabled: true
  },
  {
    id: 'cash_on_delivery',
    label: 'Contraentrega',
    description: 'Pago al recibir el lote en entrega coordinada.',
    iconName: 'handshake',
    enabled: true
  }
  // {
  //   id: 'seller_agreement',
  //   label: 'Acuerdo comercial',
  //   description: 'Condiciones personalizadas con el proveedor.',
  //   iconName: 'file-signature',
  //   enabled: true
  // }
] as const;
