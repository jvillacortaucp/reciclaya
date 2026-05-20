import { ListingDetailEntity } from '../domain/listing-detail.models';

export const LISTING_DETAIL_COPY = {
  breadcrumbParent: 'Marketplace',
  breadcrumbCurrent: 'Detalle del residuo',
  save: 'Guardar',
  primaryAction: 'Generar Orden',
  secondaryAction: 'Solicitar información',
  back: 'Volver',
  // technicalSectionTitle: 'Especificaciones Técnicas',
  businessSectionTitle: 'Datos de negocio',
  relatedSectionTitle: 'Listado similares'
} as const;

export const LISTING_DETAIL_MESSAGES = {
  loading: 'Cargando detalle del residuo...',
  notFound: 'No encontramos este lote. Es posible que ya no esté disponible.',
  saved: 'El lote se guardó en tus favoritos.',
  contacted: 'Solicitud enviada al vendedor. Te responderá en breve.'
} as const;

export function buildDeliveryModeLabel(detail: ListingDetailEntity): string {
  switch (detail.logistics.deliveryMode) {
    case 'warehouse_pickup':
      return 'Recojo en almacén';
    case 'coordinated_delivery':
      return 'Entrega coordinada';
    case 'third_party_transport':
      return 'Transporte tercero';
    default:
      return detail.logistics.deliveryMode;
  }
}

export function buildExchangeTypeLabel(detail: ListingDetailEntity): string {
  switch (detail.logistics.exchangeType) {
    case 'sale':
      return 'Venta';
    case 'barter':
      return 'Trueque';
    case 'pickup':
      return 'Recojo';
    default:
      return detail.logistics.exchangeType;
  }
}
