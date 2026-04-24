import { RecommendationProcess } from '../models/recommendation.model';

export const RECOMMENDATION_PROCESS_MOCK: RecommendationProcess = {
  recommendationId: 'rec-001',
  recommendedProduct: 'Harina funcional de cáscara de mango',
  baseResidue: 'Cáscara de mango',
  complexity: 'medium',
  totalEstimatedTime: '18-24 horas',
  approximateCost: '$420 por lote piloto',
  marketPotential: 'high',
  principalEquipment: ['Lavadora industrial', 'Secador de bandejas', 'Molino fino', 'Tamiz vibratorio'],
  expectedOutcome: 'Lote homogéneo de harina funcional apta para panificación y snacks saludables.',
  explanation:
    'La ruta propuesta aprovecha la fibra soluble y antioxidantes naturales del residuo base para crear un ingrediente funcional de alto valor comercial.',
  explanationSteps: [
    {
      id: 'exp-1',
      order: 1,
      title: 'Recolección y selección',
      shortLabel: 'Recolección',
      transformationType: 'Preacondicionamiento',
      whatHappens:
        'Se separan cáscaras aptas, se retiran impurezas y se clasifica el residuo por nivel de frescura.',
      whyItMatters:
        'Mejora la consistencia del proceso y reduce pérdidas por contaminación cruzada.',
      transformationOutcome: 'Materia prima homogénea y trazable para las siguientes etapas.',
      quickTip: 'Separar por lotes de 25-30 kg facilita control de calidad.',
      avoidRisk: 'No mezclar residuo húmedo con residuo dañado o fermentado.',
      processImageUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Reduce desperdicio por descarte temprano.', 'Disminuye riesgo de lotes contaminados.'],
        negative: ['Genera merma inicial si no hay criterio de clasificación.']
      },
      natureBenefits: ['Reduce residuos', 'Economía circular', 'Evita contaminación'],
      iconName: 'package-search'
    },
    {
      id: 'exp-2',
      order: 2,
      title: 'Lavado y desinfección',
      shortLabel: 'Lavado',
      transformationType: 'Higienización',
      whatHappens:
        'Las cáscaras se lavan y desinfectan para reducir la carga microbiana superficial.',
      whyItMatters:
        'Previene proliferación de hongos y mejora la inocuidad del producto final.',
      transformationOutcome: 'Biomasa limpia y segura para secado.',
      quickTip: 'Usar agua recirculada filtrada puede reducir consumo hasta 30%.',
      avoidRisk: 'Exceso de desinfectante puede afectar calidad organoléptica.',
      processImageUrl:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Reduce carga bacteriana y riesgo sanitario.'],
        negative: ['Uso de agua en etapa inicial.', 'Necesita manejo responsable de efluentes.']
      },
      natureBenefits: ['Evita contaminación', 'Aprovecha recursos'],
      iconName: 'droplets'
    },
    {
      id: 'exp-3',
      order: 3,
      title: 'Secado de la cáscara',
      shortLabel: 'Secado',
      transformationType: 'Transformación física',
      whatHappens:
        'Se deshidrata la cáscara mediante aire forzado a 60°C para reducir humedad del 85% a menos de 10%.',
      whyItMatters:
        'Inhibe actividad enzimática y crecimiento de moho, mejorando estabilidad del producto.',
      transformationOutcome: 'Materia seca estable lista para molienda.',
      quickTip: 'Monitorear la temperatura cada 30 min evita pardeamiento.',
      avoidRisk: 'Secado desigual puede generar focos de humedad internos.',
      processImageUrl:
        'https://images.unsplash.com/photo-1686407493217-9de8f4f1ea4b?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: [
          'Reducción drástica de desechos orgánicos.',
          'Reutilización de biomasa para nuevos productos.',
          'Menores emisiones de metano en vertederos.'
        ],
        negative: [
          'Consumo energético del proceso de secado.',
          'Uso de agua en la etapa de lavado inicial.',
          'Necesidad de control sanitario riguroso.'
        ]
      },
      natureBenefits: [
        'Reduce residuos',
        'Baja emisiones',
        'Aprovecha recursos',
        'Economía circular',
        'Evita contaminación',
        'Productos de valor'
      ],
      iconName: 'wind'
    },
    {
      id: 'exp-4',
      order: 4,
      title: 'Triturado o molienda',
      shortLabel: 'Molienda',
      transformationType: 'Reducción de tamaño',
      whatHappens: 'La cáscara seca pasa por molino para obtener polvo de granulometría controlada.',
      whyItMatters: 'Permite estandarizar textura y comportamiento funcional en formulaciones.',
      transformationOutcome: 'Harina base con distribución uniforme de partícula.',
      quickTip: 'Realizar dos pasadas para mejorar homogeneidad.',
      avoidRisk: 'Sobrecalentamiento en molino puede degradar compuestos sensibles.',
      processImageUrl:
        'https://images.unsplash.com/photo-1620395219863-c3e4f9d9f911?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Aumenta aprovechamiento integral del residuo.'],
        negative: ['Consumo eléctrico del sistema de molienda.']
      },
      natureBenefits: ['Aprovecha recursos', 'Productos de valor'],
      iconName: 'factory'
    },
    {
      id: 'exp-5',
      order: 5,
      title: 'Tamizado',
      shortLabel: 'Tamizado',
      transformationType: 'Estandarización',
      whatHappens: 'Se separa la fracción fina comercial y se reprocesan partículas gruesas.',
      whyItMatters: 'Garantiza calidad técnica consistente para clientes B2B.',
      transformationOutcome: 'Producto final dentro de especificaciones.',
      quickTip: 'Registrar rendimiento por malla para optimizar reproceso.',
      avoidRisk: 'Malla inadecuada puede incrementar merma.',
      processImageUrl:
        'https://images.unsplash.com/photo-1598514982901-2f85921fd7f5?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Reduce desperdicio por fuera de especificación.'],
        negative: ['Puede generar polvo fino si no hay control de emisiones.']
      },
      natureBenefits: ['Evita contaminación', 'Economía circular'],
      iconName: 'scan-line'
    },
    {
      id: 'exp-6',
      order: 6,
      title: 'Empaque',
      shortLabel: 'Empaque',
      transformationType: 'Conservación',
      whatHappens: 'Se envasa el producto en material barrera y se etiqueta por lote.',
      whyItMatters: 'Protege estabilidad y trazabilidad logística del producto.',
      transformationOutcome: 'Lote listo para comercialización.',
      quickTip: 'Usar empaque reciclable mejora propuesta de valor comercial.',
      avoidRisk: 'Sellado deficiente acorta vida útil del producto.',
      processImageUrl:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Mejora eficiencia logística y reduce pérdidas postproceso.'],
        negative: ['Uso de material de empaque si no se elige opción sostenible.']
      },
      natureBenefits: ['Productos de valor', 'Aprovecha recursos'],
      iconName: 'package'
    },
    {
      id: 'exp-7',
      order: 7,
      title: 'Almacenamiento',
      shortLabel: 'Almacenado',
      transformationType: 'Estabilización',
      whatHappens: 'Se mantiene el lote en condiciones controladas de temperatura y humedad.',
      whyItMatters: 'Evita degradación prematura y asegura cumplimiento de calidad.',
      transformationOutcome: 'Producto estable para despacho continuo.',
      quickTip: 'Aplicar FIFO disminuye vencimientos y sobrestock.',
      avoidRisk: 'Ambiente húmedo puede reactivar actividad microbiana.',
      processImageUrl:
        'https://images.unsplash.com/photo-1586528116493-75f6112fd68d?auto=format&fit=crop&w=1280&q=80',
      environmentalFactors: {
        positive: ['Reduce mermas y reprocesos innecesarios.'],
        negative: ['Requiere control energético del ambiente de almacenaje.']
      },
      natureBenefits: ['Reduce residuos', 'Economía circular'],
      iconName: 'archive'
    }
  ],
  environmentalSummary: {
    impactScore: 8.4,
    utilizationLevelLabel: 'Muy Alto',
    utilizationPercent: 92,
    environmentalRiskLabel: 'Bajo',
    environmentalRiskPercent: 18,
    keyRecommendation:
      'Implementar paneles solares para alimentar deshidratadores y optimizar el retorno de inversión ambiental.'
  },
  marketAnalysis: {
    finishedProduct: {
      name: 'Harina de cáscara de mango',
      useCase: 'Repostería y panificación saludable',
      suggestedFormat: 'Saco 25kg / Retail 500g',
      suggestedPricePerKg: 4.5,
      opportunityTag: 'Opportunity: High',
      productImageUrl:
        'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1280&q=80'
    },
    potentialBuyers: [
      {
        id: 'buyer-1',
        name: 'Empresas alimentarias',
        segment: 'B2B Industrial',
        monthlyVolume: '10-20 t/mes',
        probability: 85,
        channel: 'Directo',
        type: 'enterprise',
        iconName: 'building'
      },
      {
        id: 'buyer-2',
        name: 'Panaderías saludables',
        segment: 'Artesanal / Gourmet',
        monthlyVolume: '500kg - 1t/mes',
        probability: 70,
        channel: 'Distribuidores',
        type: 'retail',
        iconName: 'store'
      },
      {
        id: 'buyer-3',
        name: 'Tiendas naturistas',
        segment: 'Retail Consumidor',
        monthlyVolume: '100-300kg/mes',
        probability: 60,
        channel: 'E-commerce',
        type: 'consumer',
        iconName: 'leaf'
      }
    ],
    marketKpis: [
      {
        id: 'impact',
        label: 'Impact',
        value: 'High',
        helper: 'Demanda en expansión',
        trendPercent: 88,
        tone: 'emerald'
      },
      {
        id: 'demand',
        label: 'Potential Demand',
        value: '750 tons/year',
        helper: 'Growth: +12% YoY',
        trendPercent: 76,
        tone: 'emerald'
      },
      {
        id: 'competition',
        label: 'Competition',
        value: 'Low',
        helper: 'Niche opportunity',
        trendPercent: 32,
        tone: 'amber'
      }
    ],
    costStructure: [
      { id: 'raw', label: 'Materia prima', amountUsd: 0.2, percent: 8 },
      { id: 'process', label: 'Procesamiento', amountUsd: 1.5, percent: 61 },
      { id: 'packaging', label: 'Empaque', amountUsd: 0.45, percent: 18 },
      { id: 'logistics', label: 'Logística', amountUsd: 0.32, percent: 13 }
    ],
    estimatedGrossMarginPercent: 45.2,
    suggestedPricePerKg: 4.5,
    totalCostPerKg: 2.47,
    competitionInsight: {
      competitionLevelLabel: 'Nivel: Baja',
      directSubstitutes: [
        'Harina de coco (Precio alto)',
        'Harina de avena (Propiedades distintas)'
      ],
      positioningRecommendation:
        'Ingrediente funcional premium de economía circular: alto contenido en fibra y antioxidantes para el sector Health & Wellness.'
    },
    opportunitySummary: {
      generatedAt: 'Análisis generado hace 2 horas',
      initialInvestment: '$1,500',
      paybackPeriod: '4-6 meses',
      monthlyProfitability: '$3,200',
      sustainabilityScore: 'A++',
      nextSteps: [
        'Obtener certificación sanitaria para uso alimenticio humano.',
        'Muestreo en panaderías artesanales locales (Sector Gourmet).',
        'Escalamiento a distribución retail en 500g.'
      ],
      ecoTip:
        'El 80% de los compradores B2B en este nicho valoran los sellos de circularidad y reporte de reducción de CO2.'
    },
    chartLabels: ['Materia prima', 'Procesamiento', 'Empaque', 'Logística'],
    chartSeries: [8, 61, 18, 13]
  },
  processSteps: [
    {
      id: 'step-1',
      order: 1,
      title: 'Recolección y selección',
      shortDescription: 'Clasifica el residuo y retira impurezas visibles.',
      estimatedTime: '1.5 horas',
      requiredEquipment: ['Mesas inox', 'Bandejas', 'Guantes sanitarios'],
      keyActions: [
        'Separar cáscaras aptas y descartar material dañado.',
        'Eliminar cuerpos extraños y restos orgánicos no deseados.'
      ],
      quickTip: 'Trabaja por lotes pequeños para mantener trazabilidad.',
      riskLevel: 'low',
      iconName: 'package-search'
    },
    {
      id: 'step-2',
      order: 2,
      title: 'Lavado y desinfección',
      shortDescription: 'Reduce carga microbiana antes del secado.',
      estimatedTime: '2 horas',
      requiredEquipment: ['Tinas sanitarias', 'Agua tratada', 'Desinfectante alimentario'],
      keyActions: [
        'Realizar prelavado con agua corriente.',
        'Aplicar desinfección controlada y enjuagar.'
      ],
      quickTip: 'Controla el pH del agua para mayor estabilidad.',
      riskLevel: 'medium',
      iconName: 'droplets'
    },
    {
      id: 'step-3',
      order: 3,
      title: 'Secado controlado',
      shortDescription: 'Disminuye humedad para preservar calidad del producto final.',
      estimatedTime: '8 horas',
      requiredEquipment: ['Secador de bandejas', 'Termómetro digital', 'Higrómetro'],
      keyActions: [
        'Secar a temperatura estable entre 55°C y 60°C.',
        'Verificar humedad final menor a 12%.'
      ],
      quickTip: 'Rota bandejas cada 90 minutos para secado uniforme.',
      riskLevel: 'high',
      iconName: 'wind'
    },
    {
      id: 'step-4',
      order: 4,
      title: 'Triturado o molienda',
      shortDescription: 'Convierte la cáscara seca en polvo fino.',
      estimatedTime: '2 horas',
      requiredEquipment: ['Molino de martillos', 'Colector de polvo'],
      keyActions: [
        'Ajustar tamaño de partícula objetivo.',
        'Evitar sobrecalentamiento durante molienda.'
      ],
      quickTip: 'Molido en dos pasadas mejora homogeneidad.',
      riskLevel: 'medium',
      iconName: 'factory'
    },
    {
      id: 'step-5',
      order: 5,
      title: 'Tamizado',
      shortDescription: 'Estandariza granulometría del producto.',
      estimatedTime: '1 hora',
      requiredEquipment: ['Tamiz vibratorio', 'Mallas 60-80'],
      keyActions: ['Separar fracción fina comercial.', 'Reprocesar material fuera de especificación.'],
      quickTip: 'Documenta rendimiento por malla para ajustar proceso.',
      riskLevel: 'low',
      iconName: 'scan-line'
    },
    {
      id: 'step-6',
      order: 6,
      title: 'Empaque',
      shortDescription: 'Asegura conservación e inocuidad del producto.',
      estimatedTime: '1 hora',
      requiredEquipment: ['Selladora térmica', 'Bolsas trilaminadas', 'Etiquetadora'],
      keyActions: ['Empacar en atmósfera controlada si es posible.', 'Etiquetar lote y fecha de producción.'],
      quickTip: 'Usar empaques opacos mejora estabilidad oxidativa.',
      riskLevel: 'medium',
      iconName: 'package'
    },
    {
      id: 'step-7',
      order: 7,
      title: 'Almacenamiento',
      shortDescription: 'Conserva el lote en condiciones óptimas.',
      estimatedTime: '4 horas de estabilización inicial',
      requiredEquipment: ['Racks secos', 'Control de temperatura y humedad'],
      keyActions: [
        'Guardar por debajo de 25°C y <60% HR.',
        'Implementar FIFO para despacho.'
      ],
      quickTip: 'Monitorea humedad cada 12 horas al inicio.',
      riskLevel: 'low',
      iconName: 'archive'
    }
  ]
};
