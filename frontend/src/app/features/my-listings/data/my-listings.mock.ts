import { ExchangeType, ProductCategory, ResidueType, SectorType } from '../../../core/enums/marketplace.enums';
import { MyListing } from '../domain/my-listing.model';

export const MY_LISTINGS_MOCK: readonly MyListing[] = [
  {
    id: 'lst-001',
    title: 'Cáscara de Naranja',
    productType: ProductCategory.Mango,
    specificResidue: 'Cáscara de naranja premium',
    residueType: ResidueType.Organic,
    sector: SectorType.Agriculture,
    quantity: 15,
    unitLabel: 'Ton',
    estimatedPriceLabel: '$85/Ton',
    status: 'active',
    publishedAt: '2026-04-20',
    exchangeType: ExchangeType.Sale,
    exchangeLabel: 'Venta',
    location: 'Lima, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'lst-002',
    title: 'Melaza de Caña',
    productType: ProductCategory.Cacao,
    specificResidue: 'Melaza industrial estabilizada',
    residueType: ResidueType.Organic,
    sector: SectorType.Food,
    quantity: 50,
    unitLabel: 'Ton',
    estimatedPriceLabel: '$120/Ton',
    status: 'active',
    publishedAt: '2026-04-18',
    exchangeType: ExchangeType.Barter,
    exchangeLabel: 'Venta / Trueque',
    location: 'Trujillo, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1615486363978-4e78dce3f1f6?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'lst-003',
    title: 'Pallets de Madera',
    productType: ProductCategory.Coffee,
    specificResidue: 'Pallets reparables',
    residueType: ResidueType.Inorganic,
    sector: SectorType.Industrial,
    quantity: 200,
    unitLabel: 'Unidades',
    estimatedPriceLabel: '$12/Ud',
    status: 'active',
    publishedAt: '2026-04-14',
    exchangeType: ExchangeType.Sale,
    exchangeLabel: 'Venta Directa',
    location: 'Arequipa, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1592833167665-5b5c01f4ce9f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'lst-004',
    title: 'Pacas de cartón prensado',
    productType: ProductCategory.Coffee,
    specificResidue: 'Cartón corrugado limpio',
    residueType: ResidueType.Inorganic,
    sector: SectorType.Industrial,
    quantity: 85,
    unitLabel: 'Ton',
    estimatedPriceLabel: '$52/Ton',
    status: 'draft',
    publishedAt: '2026-04-10',
    exchangeType: ExchangeType.Sale,
    exchangeLabel: 'Venta',
    location: 'Callao, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'lst-005',
    title: 'Aserrín de pino seco',
    productType: ProductCategory.Cacao,
    specificResidue: 'Aserrín malla fina',
    residueType: ResidueType.Organic,
    sector: SectorType.Agriculture,
    quantity: 35,
    unitLabel: 'Ton',
    estimatedPriceLabel: '$64/Ton',
    status: 'inactive',
    publishedAt: '2026-03-27',
    exchangeType: ExchangeType.Pickup,
    exchangeLabel: 'Recojo',
    location: 'Cusco, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'lst-006',
    title: 'Pulpa de café fermentada',
    productType: ProductCategory.Coffee,
    specificResidue: 'Pulpa para compostaje',
    residueType: ResidueType.Organic,
    sector: SectorType.Agroindustry,
    quantity: 20,
    unitLabel: 'Ton',
    estimatedPriceLabel: '$78/Ton',
    status: 'draft',
    publishedAt: '2026-04-06',
    exchangeType: ExchangeType.Barter,
    exchangeLabel: 'Trueque',
    location: 'Puno, Perú',
    imageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80'
  }
];
