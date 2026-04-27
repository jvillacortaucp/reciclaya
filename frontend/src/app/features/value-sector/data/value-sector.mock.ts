import { ValueSectorRoute } from '../models/value-sector.model';

export const VALUE_SECTOR_MOCK: readonly ValueSectorRoute[] = [
  {
    id: 'alimentaria',
    routeName: 'Alimentaria',
    shortDescription: 'Valorización de fibra y compuestos funcionales para formulaciones food-grade.',
    iconName: 'utensils',
    marketPotential: 'high',
    targetIndustries: ['Food', 'Bakery', 'Retail'],
    insight:
      'La cáscara de mango es rica en fibra soluble. El secado y molienda conservan alto valor nutricional.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'harina-funcional',
        name: 'Harina funcional',
        description: 'Base para panificación y mezclas nutricionales.',
        complexity: 'medium',
        marketPotential: 'high',
        potentialUse: 'Panificados funcionales y mezclas enriquecidas'
      },
      {
        id: 'snacks-saludables',
        name: 'Snacks saludables',
        description: 'Insumo para snacks horneados de alto valor.',
        complexity: 'low',
        marketPotential: 'medium',
        potentialUse: 'Snacks altos en fibra para retail'
      },
      {
        id: 'fibra-alimentaria',
        name: 'Fibra alimentaria',
        description: 'Aditivo natural para mejorar contenido de fibra.',
        complexity: 'medium',
        marketPotential: 'high',
        potentialUse: 'Fortificación de productos procesados'
      },
      {
        id: 'ingredientes-funcionales',
        name: 'Ingredientes funcionales',
        description: 'Mezcla base para formulación de alimentos saludables.',
        complexity: 'medium',
        marketPotential: 'high',
        potentialUse: 'Desarrollo de línea funcional en marca blanca'
      }
    ]
  },
  {
    id: 'nutraceutica',
    routeName: 'Nutracéutica',
    shortDescription: 'Concentrados vitamínicos y suplementos dietéticos de alto margen.',
    iconName: 'pill',
    marketPotential: 'high',
    targetIndustries: ['Nutrición', 'Farmacia', 'Wellness'],
    insight: 'El fraccionamiento en polvo micronizado mejora la biodisponibilidad para suplementos.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'capsulas-fibra',
        name: 'Cápsulas de fibra',
        description: 'Suplemento digestivo de rápida formulación.',
        complexity: 'high',
        marketPotential: 'high',
        potentialUse: 'Línea premium de salud digestiva'
      },
      {
        id: 'blend-vitaminico',
        name: 'Blend vitamínico',
        description: 'Mezcla funcional para nutracéuticos premium.',
        complexity: 'high',
        marketPotential: 'medium',
        potentialUse: 'Sachet funcional para canales farmacias'
      }
    ]
  },
  {
    id: 'cosmetica',
    routeName: 'Cosmética',
    shortDescription: 'Extracción de antioxidantes para sérums y mascarillas.',
    iconName: 'sparkles',
    marketPotential: 'medium',
    targetIndustries: ['Beauty', 'Dermocosmética', 'Laboratorio'],
    insight: 'Los extractos antioxidantes derivados de mango elevan margen en líneas cosméticas naturales.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1556228720-da4e85f25d1b?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'extracto-polifenoles',
        name: 'Extracto de polifenoles',
        description: 'Activo antioxidante para formulación anti-edad.',
        complexity: 'medium',
        marketPotential: 'high',
        potentialUse: 'Cosmética funcional de alta rotación'
      },
      {
        id: 'serum-botanico',
        name: 'Sérum botánico',
        description: 'Concentrado base para cuidado facial.',
        complexity: 'high',
        marketPotential: 'medium',
        potentialUse: 'Líneas premium clean beauty'
      }
    ]
  },
  {
    id: 'alimento-animal',
    routeName: 'Alimento animal',
    shortDescription: 'Formulación de insumos para nutrición animal de costo eficiente.',
    iconName: 'package',
    marketPotential: 'medium',
    targetIndustries: ['Avícola', 'Ganadería', 'Pet food'],
    insight: 'La fibra estabilizada puede incorporarse como ingrediente funcional en mezclas balanceadas.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'harina-pecuaria',
        name: 'Harina pecuaria',
        description: 'Insumo seco para formulaciones balanceadas.',
        complexity: 'medium',
        marketPotential: 'medium',
        potentialUse: 'Alimentos balanceados industriales'
      }
    ]
  },
  {
    id: 'agricultura',
    routeName: 'Agricultura',
    shortDescription: 'Aplicaciones para nutrición vegetal y suelos regenerativos.',
    iconName: 'sprout',
    marketPotential: 'medium',
    targetIndustries: ['Agrícola', 'Agrotech', 'Cooperativas'],
    insight: 'La biomasa residual puede convertirse en mejoradores de suelo de bajo costo.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'compost-premium',
        name: 'Compost',
        description: 'Base orgánica estabilizada para fertilización.',
        complexity: 'low',
        marketPotential: 'medium',
        potentialUse: 'Programas de suelo regenerativo'
      },
      {
        id: 'biofertilizante',
        name: 'Biofertilizante',
        description: 'Extracto líquido para potenciar desarrollo vegetal.',
        complexity: 'medium',
        marketPotential: 'medium',
        potentialUse: 'Cultivos de alta productividad'
      },
      {
        id: 'sustrato',
        name: 'Sustrato',
        description: 'Base fibrosa para viveros y almácigos.',
        complexity: 'low',
        marketPotential: 'medium',
        potentialUse: 'Producción hortícola y viveros'
      },
      {
        id: 'mulch',
        name: 'Mulch',
        description: 'Cobertura orgánica para conservación de humedad.',
        complexity: 'low',
        marketPotential: 'low',
        potentialUse: 'Manejo de suelo agrícola'
      }
    ]
  },
  {
    id: 'energia',
    routeName: 'Energía',
    shortDescription: 'Aprovechamiento para bioenergía y combustibles alternativos.',
    iconName: 'flame',
    marketPotential: 'medium',
    targetIndustries: ['Bioenergía', 'Industrial', 'Servicios'],
    insight: 'La valorización energética reduce costos de disposición y mejora huella ambiental.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'sustrato-biogas',
        name: 'Sustrato para biogás',
        description: 'Materia orgánica para digestores anaeróbicos.',
        complexity: 'medium',
        marketPotential: 'medium',
        potentialUse: 'Plantas de biogás industriales'
      }
    ]
  },
  {
    id: 'biomateriales',
    routeName: 'Biomateriales',
    shortDescription: 'Compuestos biodegradables para empaques y piezas circulares.',
    iconName: 'microscope',
    marketPotential: 'medium',
    targetIndustries: ['Empaque', 'Manufactura', 'B2B'],
    insight: 'Mezclas con biopolímeros habilitan empaques compostables para retail.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'biopellet',
        name: 'Biopellet',
        description: 'Materia prima para extrusión de piezas.',
        complexity: 'high',
        marketPotential: 'medium',
        potentialUse: 'Piezas livianas industriales'
      }
    ]
  },
  {
    id: 'quimica-verde',
    routeName: 'Química verde',
    shortDescription: 'Transformación en compuestos químicos de menor impacto.',
    iconName: 'flask-conical',
    marketPotential: 'high',
    targetIndustries: ['Química', 'Laboratorio', 'Ingredientes'],
    insight: 'La extracción selectiva permite moléculas de valor para formulación sostenible.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'extracto-citrico',
        name: 'Extracto cítrico técnico',
        description: 'Compuesto para formulaciones de limpieza.',
        complexity: 'high',
        marketPotential: 'high',
        potentialUse: 'Línea industrial eco-clean'
      }
    ]
  },
  {
    id: 'absorbentes',
    routeName: 'Absorbentes',
    shortDescription: 'Fibras técnicas para control de derrames y filtración.',
    iconName: 'droplets',
    marketPotential: 'medium',
    targetIndustries: ['Minería', 'Oil & Gas', 'Logística'],
    insight: 'La estructura fibrosa funciona como absorbente técnico de bajo costo.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'manta-absorbente',
        name: 'Manta absorbente',
        description: 'Material para mitigación de derrames.',
        complexity: 'medium',
        marketPotential: 'medium',
        potentialUse: 'Protocolos de seguridad industrial'
      }
    ]
  },
  {
    id: 'construccion',
    routeName: 'Construcción',
    shortDescription: 'Aplicaciones para paneles y agregados livianos.',
    iconName: 'hammer',
    marketPotential: 'medium',
    targetIndustries: ['Construcción', 'Arquitectura', 'Obra'],
    insight: 'La biomasa procesada puede incorporarse en materiales de obra de bajo peso.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'panel-ligero',
        name: 'Panel ligero técnico',
        description: 'Panel para divisiones interiores.',
        complexity: 'high',
        marketPotential: 'medium',
        potentialUse: 'Sistemas constructivos prefabricados'
      }
    ]
  },
  {
    id: 'packaging',
    routeName: 'Packaging',
    shortDescription: 'Empaques compostables y recubrimientos biodegradables.',
    iconName: 'package',
    marketPotential: 'high',
    targetIndustries: ['Packaging', 'Retail', 'E-commerce'],
    insight: 'Empaques sostenibles mejoran percepción de marca y habilitan certificaciones verdes.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'bandeja-fibra',
        name: 'Bandeja de fibra',
        description: 'Sustituto compostable para bandejas plásticas.',
        complexity: 'medium',
        marketPotential: 'high',
        potentialUse: 'Canal retail y food service'
      }
    ]
  },
  {
    id: 'marketplace',
    routeName: 'Marketplace',
    shortDescription: 'Comercialización directa de lotes clasificados por calidad.',
    iconName: 'store',
    marketPotential: 'high',
    targetIndustries: ['B2B', 'Exportación', 'Distribución'],
    insight: 'La venta estructurada por lotes acelera rotación y mejora ticket promedio.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1280&q=80',
    products: [
      {
        id: 'lote-estandarizado',
        name: 'Lote estandarizado',
        description: 'Oferta comercial con trazabilidad y ficha técnica.',
        complexity: 'low',
        marketPotential: 'high',
        potentialUse: 'Venta rápida en canales B2B'
      }
    ]
  }
];
