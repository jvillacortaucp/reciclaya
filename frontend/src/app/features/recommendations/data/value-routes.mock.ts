import { ValueRoute } from '../models/value-route.model';

export const VALUE_ROUTES_MOCK: readonly ValueRoute[] = [
  {
    id: 'alimentaria',
    name: 'Alimentaria',
    description: 'Valorización de fibra y compuestos funcionales para formulaciones food-grade.',
    icon: 'utensils',
    complexity: 'baja',
    potential: 'muy-alto',
    displayOrder: 1,
    heroImageUrl:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Food', 'Bakery', 'Retail'],
    valueInsight:
      'La cáscara de mango es rica en fibra soluble. El proceso de secado y molienda conserva el 85% de los nutrientes base.',
    products: [
      {
        id: 'harina-funcional',
        name: 'Harina funcional',
        icon: 'leaf',
        shortDescription: 'Base para panificación y mezcla nutricional.'
      },
      {
        id: 'snacks-saludables',
        name: 'Snacks saludables',
        icon: 'cookie',
        shortDescription: 'Insumo para snacks horneados de alto valor.'
      },
      {
        id: 'fibra-alimentaria',
        name: 'Fibra alimentaria',
        icon: 'sparkles',
        shortDescription: 'Aditivo natural para mejorar contenido de fibra.'
      }
    ]
  },
  {
    id: 'cosmetica',
    name: 'Cosmética',
    description: 'Extracción de polifenoles y antioxidantes para sérums y mascarillas premium.',
    icon: 'sparkles',
    complexity: 'media',
    potential: 'alto',
    displayOrder: 2,
    heroImageUrl:
      'https://images.unsplash.com/photo-1556228720-da4e85f25d1b?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Beauty', 'Dermocosmética', 'Laboratorio'],
    valueInsight:
      'Los extractos antioxidantes derivados del mango elevan el margen en líneas cosméticas funcionales.',
    products: [
      {
        id: 'extracto-polifenoles',
        name: 'Extracto de polifenoles',
        icon: 'droplets',
        shortDescription: 'Activo antioxidante para líneas anti-edad.'
      },
      {
        id: 'serum-botanico',
        name: 'Sérum botánico',
        icon: 'beaker',
        shortDescription: 'Concentrado base para formulaciones de cuidado facial.'
      }
    ]
  },
  {
    id: 'nutraceutica',
    name: 'Nutracéutica',
    description: 'Concentrados vitamínicos y suplementos dietéticos de alto margen.',
    icon: 'pill',
    complexity: 'alta',
    potential: 'alto',
    displayOrder: 3,
    heroImageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Nutrición', 'Farmacia', 'Wellness'],
    valueInsight:
      'El fraccionamiento en polvo micronizado mejora la biodisponibilidad para suplementos.',
    products: [
      {
        id: 'capsulas-fibra',
        name: 'Cápsulas de fibra',
        icon: 'pill',
        shortDescription: 'Suplemento digestivo de rápida formulación.'
      },
      {
        id: 'blend-vitaminico',
        name: 'Blend vitamínico',
        icon: 'microscope',
        shortDescription: 'Mezcla funcional para nutracéuticos premium.'
      }
    ]
  },
  {
    id: 'biomateriales',
    name: 'Biomateriales',
    description: 'Compuestos biodegradables para empaques y piezas de valor circular.',
    icon: 'microscope',
    complexity: 'media',
    potential: 'medio',
    displayOrder: 4,
    heroImageUrl:
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Empaque', 'Manufactura', 'B2B'],
    valueInsight:
      'La mezcla con biopolímeros permite crear empaques compostables para retail especializado.',
    products: [
      {
        id: 'biofilm',
        name: 'Biofilm flexible',
        icon: 'package',
        shortDescription: 'Película biodegradable para envoltura.'
      },
      {
        id: 'biopellet',
        name: 'Biopellet',
        icon: 'zap',
        shortDescription: 'Materia prima para extrusión de piezas.'
      }
    ]
  },
  {
    id: 'energia',
    name: 'Energía',
    description: 'Aprovechamiento para bioenergía y combustibles alternativos.',
    icon: 'zap',
    complexity: 'media',
    potential: 'medio',
    displayOrder: 5,
    heroImageUrl:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Bioenergía', 'Servicios', 'Industrial'],
    valueInsight: 'La valorización energética reduce costos de disposición y mejora huella ambiental.',
    products: [
      {
        id: 'biogas',
        name: 'Sustrato para biogás',
        icon: 'zap',
        shortDescription: 'Materia orgánica para digestores anaeróbicos.'
      }
    ]
  },
  {
    id: 'packaging',
    name: 'Packaging',
    description: 'Aplicaciones en empaque compostable y recubrimientos biodegradables.',
    icon: 'package',
    complexity: 'baja',
    potential: 'alto',
    displayOrder: 6,
    heroImageUrl:
      'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1280&q=80',
    targetIndustries: ['Packaging', 'Retail', 'E-commerce'],
    valueInsight:
      'El uso en empaques sostenibles eleva percepción de marca y habilita certificaciones verdes.',
    products: [
      {
        id: 'bandeja-fibra',
        name: 'Bandeja de fibra',
        icon: 'package',
        shortDescription: 'Sustituto compostable para bandejas plásticas.'
      }
    ]
  }
];
