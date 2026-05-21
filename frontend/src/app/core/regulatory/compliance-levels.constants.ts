import { ComplianceLevelDefinition, StoredComplianceLevelsState } from './compliance-levels.models';

export const COMPLIANCE_LEVEL_DEFINITIONS: readonly ComplianceLevelDefinition[] = [
  {
    id: 1,
    slug: 'residuos-libres',
    title: 'Nivel 1 · Residuos libres',
    subtitle: 'Regularización básica',
    regularizationLabel: 'Regularización Básica',
    riskLevel: 'low',
    fiscalization: 'Baja. Principalmente municipal, comercial y tributaria.',
    objective: [
      'Facilitar el reciclaje básico.',
      'Impulsar economía circular.',
      'Promover la formalización inicial.',
      'Favorecer el crecimiento masivo del marketplace.'
    ],
    includedWasteCategories: [
      { id: 'paper-cardboard', title: 'Papel y cartón', examples: ['Cajas', 'Periódicos', 'Revistas', 'Cuadernos'] },
      { id: 'common-plastics', title: 'Plásticos comunes', examples: ['PET', 'HDPE', 'Botellas', 'Envases'] },
      { id: 'glass', title: 'Vidrio', examples: ['Botellas', 'Frascos'] },
      { id: 'metals', title: 'Metales reciclables', examples: ['Aluminio', 'Fierro', 'Latas'] }
    ],
    sellerRequirements: [
      {
        id: 'seller-natural-l1',
        title: 'Persona natural',
        requiredItems: ['DNI vigente', 'Datos de contacto'],
        recommendedItems: ['Dirección válida']
      },
      {
        id: 'seller-business-l1',
        title: 'Negocio o empresa',
        requiredItems: ['RUC activo', 'Dirección comercial'],
        recommendedItems: ['Licencia municipal']
      }
    ],
    buyerRequirements: [
      {
        id: 'buyer-general-l1',
        title: 'Comprador',
        requiredItems: ['RUC activo', 'Licencia municipal'],
        recommendedItems: ['Centro de acopio identificado', 'Evidencia de operación formal']
      }
    ],
    platformValidations: {
      allowed: ['Publicación inmediata', 'Negociación libre', 'Operaciones abiertas'],
      required: ['Identificación del material', 'Origen básico del residuo']
    },
    restrictions: ['Residuos contaminados', 'Mezcla con químicos', 'Materiales peligrosos ocultos'],
    traceability: {
      label: 'Trazabilidad básica',
      items: ['Usuario', 'Fecha', 'Peso aproximado', 'Ubicación']
    },
    legalRisks: {
      label: 'Riesgos legales',
      items: ['Informalidad', 'Disposición incorrecta', 'Conflictos municipales']
    },
    regulations: ['D.L. 1278', 'D.S. 014-2017-MINAM', 'Ordenanzas municipales'],
    requirementsForUpload: [
      {
        id: 'l1-seller-dni-ruc',
        levelId: 1,
        title: 'Identificación del operador',
        description: 'DNI si eres persona natural o constancia de RUC activo si operas como empresa.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'approved',
        uploadedFileName: 'dni-frontal.jpg',
        uploadedFileUrl: null,
        uploadedFileKind: 'image',
        notes: 'Validado previamente.'
      },
      {
        id: 'l1-seller-address',
        levelId: 1,
        title: 'Dirección de operación',
        description: 'Documento simple que respalde la dirección declarada.',
        required: false,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'approved',
        uploadedFileName: 'recibo-servicio.pdf',
        uploadedFileUrl: null,
        uploadedFileKind: 'pdf',
        notes: 'Documento referencial.'
      },
      {
        id: 'l1-buyer-license',
        levelId: 1,
        title: 'Licencia municipal del comprador',
        description: 'Licencia o constancia municipal para operar el punto de acopio.',
        required: true,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'approved',
        uploadedFileName: 'licencia-municipal.pdf',
        uploadedFileUrl: null,
        uploadedFileKind: 'pdf',
        notes: 'Aprobado.'
      }
    ]
  },
  {
    id: 2,
    slug: 'residuos-controlados',
    title: 'Nivel 2 · Residuos controlados',
    subtitle: 'Regularización intermedia',
    regularizationLabel: 'Regularización Intermedia',
    riskLevel: 'medium',
    fiscalization: 'Municipal + sanitaria parcial.',
    objective: [
      'Controlar residuos con contaminación orgánica.',
      'Asegurar almacenamiento adecuado.',
      'Reducir riesgos a la salud pública.'
    ],
    includedWasteCategories: [
      { id: 'organic', title: 'Orgánicos', examples: ['Restos de comida', 'Frutas', 'Verduras', 'Cáscaras'] },
      { id: 'agroindustrial', title: 'Agroindustriales', examples: ['Bagazo', 'Residuos agrícolas', 'Residuos vegetales'] },
      { id: 'livestock', title: 'Pecuarios', examples: ['Estiércol', 'Residuos avícolas', 'Residuos ganaderos'] },
      { id: 'industrial-simple', title: 'Industriales simples', examples: ['Madera tratada', 'Textiles industriales', 'Caucho no peligroso'] }
    ],
    sellerRequirements: [
      {
        id: 'seller-natural-l2',
        title: 'Persona natural',
        requiredItems: ['DNI', 'Dirección'],
        recommendedItems: ['RUC si supera volumen comercial']
      },
      {
        id: 'seller-business-l2',
        title: 'Empresa o negocio',
        requiredItems: ['RUC activo', 'Licencia municipal'],
        recommendedItems: ['Permiso sanitario municipal', 'Autorización de almacenamiento']
      }
    ],
    buyerRequirements: [
      {
        id: 'buyer-general-l2',
        title: 'Comprador',
        requiredItems: ['RUC', 'Licencia municipal'],
        recommendedItems: ['Autorización sanitaria', 'Zona de almacenamiento', 'Plan básico de manejo']
      }
    ],
    platformValidations: {
      allowed: ['Publicaciones controladas', 'Revisión documental parcial', 'Límites de volumen'],
      required: ['Clasificación básica', 'Control de volumen y frecuencia', 'Evidencia fotográfica']
    },
    restrictions: ['Acumulación excesiva', 'Residuos sin clasificación', 'Almacenamiento inseguro'],
    traceability: {
      label: 'Trazabilidad media',
      items: ['Origen', 'Volumen', 'Frecuencia', 'Comprador', 'Evidencia fotográfica']
    },
    legalRisks: {
      label: 'Riesgos legales',
      items: ['Olores', 'Vectores', 'Contaminación biológica', 'Conflictos sanitarios']
    },
    regulations: ['D.L. 1278', 'D.S. 014-2017-MINAM', 'Ley General del Ambiente', 'Regulación sanitaria municipal'],
    requirementsForUpload: [
      {
        id: 'l2-seller-ruc-volume',
        levelId: 2,
        title: 'RUC para volumen comercial',
        description: 'Soporte tributario para operaciones recurrentes o de escala comercial.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'approved',
        uploadedFileName: 'constancia-ruc.pdf',
        uploadedFileUrl: null,
        uploadedFileKind: 'pdf',
        notes: 'RUC activo.'
      },
      {
        id: 'l2-seller-license',
        levelId: 2,
        title: 'Licencia municipal',
        description: 'Licencia o autorización municipal del punto operativo.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'in_review',
        uploadedFileName: 'licencia-funcionamiento.pdf',
        uploadedFileUrl: null,
        uploadedFileKind: 'pdf',
        notes: 'En revisión documental.'
      },
      {
        id: 'l2-seller-classification',
        levelId: 2,
        title: 'Clasificación del residuo',
        description: 'Ficha o declaración del tipo de residuo y manejo básico.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'uploaded',
        uploadedFileName: 'clasificacion-residuo.jpg',
        uploadedFileUrl: null,
        uploadedFileKind: 'image',
        notes: 'Pendiente de validar.'
      },
      {
        id: 'l2-buyer-storage',
        levelId: 2,
        title: 'Zona de almacenamiento',
        description: 'Evidencia del área de almacenamiento temporal del comprador.',
        required: false,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: 'Puedes adjuntar fotos o plano simple.'
      }
    ]
  },
  {
    id: 3,
    slug: 'residuos-regulados',
    title: 'Nivel 3 · Residuos regulados',
    subtitle: 'Regularización avanzada',
    regularizationLabel: 'Regularización Avanzada',
    riskLevel: 'medium_high',
    fiscalization: 'MINAM + OEFA.',
    objective: [
      'Garantizar trazabilidad.',
      'Asegurar reciclaje formal.',
      'Impulsar valorización segura.',
      'Mantener control ambiental.'
    ],
    includedWasteCategories: [
      { id: 'raee', title: 'RAEE', examples: ['Laptops', 'Celulares', 'TVs', 'Impresoras', 'Monitores'] },
      { id: 'electronics', title: 'Electrónicos', examples: ['Placas', 'Cables', 'Periféricos'] },
      { id: 'minor-batteries', title: 'Baterías menores', examples: ['Pilas', 'Baterías pequeñas'] }
    ],
    sellerRequirements: [
      {
        id: 'seller-natural-l3',
        title: 'Persona natural',
        requiredItems: ['DNI', 'Declaración de origen'],
        recommendedItems: []
      },
      {
        id: 'seller-business-l3',
        title: 'Empresa',
        requiredItems: ['RUC', 'Registro comercial', 'Clasificación de residuos'],
        recommendedItems: ['Control interno de residuos', 'Inventario']
      }
    ],
    buyerRequirements: [
      {
        id: 'buyer-general-l3',
        title: 'Comprador',
        requiredItems: ['EO-RS autorizada', 'Autorización de valorización', 'Almacenamiento seguro', 'Trazabilidad operativa'],
        recommendedItems: ['Protocolos de seguridad', 'Control de inventarios']
      }
    ],
    platformValidations: {
      allowed: ['Validación documental', 'Aprobación administrativa', 'Verificación de permisos'],
      required: ['Permisos vigentes', 'Trazabilidad del operador', 'Control documental']
    },
    restrictions: ['Compradores no autorizados', 'Operaciones anónimas', 'Recolección informal'],
    traceability: {
      label: 'Trazabilidad alta',
      items: ['Operador', 'Documentos', 'Historial', 'Rutas', 'Peso exacto', 'Evidencia de entrega']
    },
    legalRisks: {
      label: 'Riesgos legales',
      items: ['Contaminación por metales pesados', 'Disposición ilegal', 'Incumplimiento ambiental']
    },
    regulations: ['D.L. 1278', 'D.S. 014-2017-MINAM', 'Ley 29325', 'Regulación OEFA', 'Normativa RAEE'],
    requirementsForUpload: [
      {
        id: 'l3-seller-origin',
        levelId: 3,
        title: 'Declaración de origen',
        description: 'Documento que acredite procedencia y trazabilidad inicial del residuo.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: 'Obligatorio para abrir el nivel.'
      },
      {
        id: 'l3-seller-classification',
        levelId: 3,
        title: 'Clasificación técnica',
        description: 'Ficha de clasificación técnica o equivalente.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      },
      {
        id: 'l3-buyer-eors',
        levelId: 3,
        title: 'Autorización EO-RS',
        description: 'Registro o autorización de empresa operadora de residuos sólidos.',
        required: true,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      },
      {
        id: 'l3-buyer-safe-storage',
        levelId: 3,
        title: 'Almacenamiento seguro',
        description: 'Evidencia de almacenamiento segregado y controlado.',
        required: true,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      }
    ]
  },
  {
    id: 4,
    slug: 'residuos-criticos',
    title: 'Nivel 4 · Residuos críticos',
    subtitle: 'Regularización especializada',
    regularizationLabel: 'Regularización Especializada',
    riskLevel: 'high',
    fiscalization: 'MINAM + OEFA + DIGESA + MTC.',
    objective: [
      'Controlar residuos peligrosos.',
      'Reducir riesgos sanitarios y químicos.',
      'Minimizar impacto ambiental grave.'
    ],
    includedWasteCategories: [
      { id: 'chemical', title: 'Químicos', examples: ['Solventes', 'Reactivos', 'Pinturas'] },
      { id: 'hydrocarbons', title: 'Hidrocarburos', examples: ['Aceite usado', 'Lubricantes'] },
      { id: 'biocontaminated', title: 'Biocontaminados', examples: ['Residuos hospitalarios', 'Material infeccioso'] },
      { id: 'hazardous-industrial', title: 'Industriales peligrosos', examples: ['Corrosivos', 'Tóxicos', 'Inflamables'] }
    ],
    sellerRequirements: [
      {
        id: 'seller-company-l4',
        title: 'Empresa o institución',
        requiredItems: ['RUC', 'Clasificación del residuo', 'Registro interno', 'Manifiestos', 'Plan de manejo'],
        recommendedItems: ['Autorización sanitaria', 'Protocolos de seguridad']
      }
    ],
    buyerRequirements: [
      {
        id: 'buyer-general-l4',
        title: 'Comprador',
        requiredItems: [
          'EO-RS para residuos peligrosos',
          'Autorización de transporte MATPEL',
          'Plan de manejo',
          'Almacenamiento especializado',
          'Manifiestos',
          'Trazabilidad completa'
        ],
        recommendedItems: ['Seguros ambientales', 'Protocolos de emergencia', 'Monitoreo operativo']
      }
    ],
    platformValidations: {
      allowed: ['Aprobación manual', 'Auditoría documental', 'Validación avanzada', 'Trazabilidad obligatoria'],
      required: ['Validación humana', 'Operadores autorizados', 'Soporte documental integral']
    },
    restrictions: ['Marketplace abierto', 'Operaciones informales', 'Usuarios no verificados', 'Transporte no autorizado'],
    traceability: {
      label: 'Trazabilidad completa',
      items: ['Manifiestos', 'Operador', 'Vehículo', 'Conductor', 'Ruta', 'Destino final', 'Evidencias', 'Permisos', 'Certificados']
    },
    legalRisks: {
      label: 'Riesgos legales',
      items: [
        'Sanciones OEFA',
        'Responsabilidad civil',
        'Responsabilidad administrativa',
        'Clausuras',
        'Multas ambientales',
        'Posibles delitos ambientales'
      ]
    },
    regulations: ['D.L. 1278', 'D.S. 014-2017-MINAM', 'Ley 28256', 'D.S. 021-2008-MTC', 'Ley 28611', 'Ley 29325', 'Regulación DIGESA', 'Regulación OEFA'],
    requirementsForUpload: [
      {
        id: 'l4-seller-classification',
        levelId: 4,
        title: 'Clasificación del residuo crítico',
        description: 'Documento técnico que clasifique el residuo y sus riesgos.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      },
      {
        id: 'l4-seller-manifest',
        levelId: 4,
        title: 'Manifiestos y registro interno',
        description: 'Manifiestos de manejo y control interno del residuo.',
        required: true,
        actorType: 'seller',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      },
      {
        id: 'l4-buyer-matpel',
        levelId: 4,
        title: 'Autorización MATPEL',
        description: 'Autorización vigente para transporte de materiales peligrosos.',
        required: true,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      },
      {
        id: 'l4-buyer-storage',
        levelId: 4,
        title: 'Almacenamiento especializado',
        description: 'Evidencia del almacenamiento especializado y protocolos asociados.',
        required: true,
        actorType: 'buyer',
        acceptedFileTypes: ['pdf', 'image'],
        currentStatus: 'pending',
        uploadedFileName: null,
        uploadedFileUrl: null,
        uploadedFileKind: null,
        notes: null
      }
    ]
  }
] as const;

export const COMPLIANCE_INITIAL_STATE: StoredComplianceLevelsState = {
  updatedAt: '2026-05-20T00:00:00.000Z',
  requirements: Object.fromEntries(
    COMPLIANCE_LEVEL_DEFINITIONS.flatMap((level) =>
      level.requirementsForUpload.map((requirement) => [
        requirement.id,
        {
          currentStatus: requirement.currentStatus,
          uploadedFileName: requirement.uploadedFileName,
          uploadedFileKind: requirement.uploadedFileKind,
          notes: requirement.notes
        }
      ])
    )
  )
};
