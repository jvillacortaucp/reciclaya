import { Profile } from '../../features/profile/profile.models';
import {
  BuyerComplianceFlags,
  RegulatoryClassifyInput,
  RegulatoryEvaluation,
  RegulatoryLevel,
  RegulatoryLevelRule,
  RegulatoryRequirementDefinition,
  RegulatoryRequirementStatus,
  RegulatoryStatus,
  SellerComplianceFlags
} from './regulatory.models';

export const DEFAULT_SELLER_COMPLIANCE: SellerComplianceFlags = {
  municipalLicense: false,
  sanitaryPermit: false,
  storageAuthorization: false,
  originDeclaration: false,
  wasteClassification: false,
  commercialRegistration: false,
  internalInventory: false,
  manifest: false,
  managementPlan: false,
  safetyProtocols: false
};

export const DEFAULT_BUYER_COMPLIANCE: BuyerComplianceFlags = {
  municipalLicense: false,
  formalOperationEvidence: false,
  collectionCenter: false,
  sanitaryAuthorization: false,
  storageZone: false,
  basicManagementPlan: false,
  eorsAuthorization: false,
  valorizationAuthorization: false,
  safeStorage: false,
  specializedStorage: false,
  operationalTraceability: false,
  matpelAuthorization: false,
  manifest: false,
  emergencyProtocols: false,
  environmentalInsurance: false,
  operationalMonitoring: false
};

const sellerRequirementsByLevel: Record<1 | 2 | 3 | 4, readonly RegulatoryRequirementDefinition[]> = {
  1: [
    { code: 'identity_or_ruc', label: 'Identidad válida o RUC activo', actor: 'seller', required: true },
    { code: 'address', label: 'Dirección operativa identificable', actor: 'seller', required: true },
    { code: 'municipalLicense', label: 'Licencia municipal vigente', actor: 'seller', required: false }
  ],
  2: [
    { code: 'identity_or_ruc', label: 'Identidad válida o RUC activo', actor: 'seller', required: true },
    { code: 'address', label: 'Dirección operativa identificable', actor: 'seller', required: true },
    { code: 'commercial_ruc_if_volume', label: 'RUC empresarial para volumen comercial', actor: 'seller', required: true, note: 'Aplica cuando el volumen publicado es comercial.' },
    { code: 'wasteClassification', label: 'Clasificación declarada del residuo', actor: 'seller', required: true },
    { code: 'municipalLicense', label: 'Licencia municipal vigente', actor: 'seller', required: false },
    { code: 'sanitaryPermit', label: 'Permiso sanitario o local equivalente', actor: 'seller', required: false },
    { code: 'storageAuthorization', label: 'Autorización básica de almacenamiento', actor: 'seller', required: false },
    { code: 'originDeclaration', label: 'Declaración de origen del residuo', actor: 'seller', required: false }
  ],
  3: [
    { code: 'identity_or_ruc', label: 'Identidad o RUC del operador', actor: 'seller', required: true },
    { code: 'wasteClassification', label: 'Clasificación técnica del residuo', actor: 'seller', required: true },
    { code: 'originDeclaration', label: 'Declaración de origen documentada', actor: 'seller', required: true },
    { code: 'commercialRegistration', label: 'Registro comercial o formalidad equivalente', actor: 'seller', required: true },
    { code: 'internalInventory', label: 'Control interno o inventario del residuo', actor: 'seller', required: true },
    { code: 'storageAuthorization', label: 'Autorización de almacenamiento controlado', actor: 'seller', required: false },
    { code: 'safetyProtocols', label: 'Protocolos de seguridad operativa', actor: 'seller', required: false }
  ],
  4: [
    { code: 'company_ruc', label: 'RUC empresarial activo', actor: 'seller', required: true },
    { code: 'commercialRegistration', label: 'Formalidad comercial/registral vigente', actor: 'seller', required: true },
    { code: 'wasteClassification', label: 'Clasificación técnica del residuo', actor: 'seller', required: true },
    { code: 'internalInventory', label: 'Registro interno e inventario', actor: 'seller', required: true },
    { code: 'manifest', label: 'Manifiestos de manejo y traslado', actor: 'seller', required: true },
    { code: 'managementPlan', label: 'Plan de manejo aprobado', actor: 'seller', required: true },
    { code: 'safetyProtocols', label: 'Protocolos de seguridad y contingencia', actor: 'seller', required: true }
  ]
};

const buyerRequirementsByLevel: Record<1 | 2 | 3 | 4, readonly RegulatoryRequirementDefinition[]> = {
  1: [
    { code: 'company_ruc', label: 'RUC activo del comprador', actor: 'buyer', required: true },
    { code: 'municipalLicense', label: 'Licencia municipal vigente', actor: 'buyer', required: true },
    { code: 'formalOperationEvidence', label: 'Evidencia básica de operación formal', actor: 'buyer', required: false }
  ],
  2: [
    { code: 'company_ruc', label: 'RUC activo del comprador', actor: 'buyer', required: true },
    { code: 'municipalLicense', label: 'Licencia municipal vigente', actor: 'buyer', required: true },
    { code: 'collectionCenter', label: 'Centro de acopio o recepción identificado', actor: 'buyer', required: false },
    { code: 'sanitaryAuthorization', label: 'Autorización sanitaria aplicable', actor: 'buyer', required: false },
    { code: 'storageZone', label: 'Zona de almacenamiento definida', actor: 'buyer', required: false },
    { code: 'basicManagementPlan', label: 'Plan básico de manejo', actor: 'buyer', required: false }
  ],
  3: [
    { code: 'company_ruc', label: 'RUC activo del comprador', actor: 'buyer', required: true },
    { code: 'eorsAuthorization', label: 'EO-RS o habilitación equivalente', actor: 'buyer', required: true },
    { code: 'valorizationAuthorization', label: 'Autorización de valorización', actor: 'buyer', required: true },
    { code: 'safeStorage', label: 'Almacenamiento seguro y segregado', actor: 'buyer', required: true },
    { code: 'operationalTraceability', label: 'Trazabilidad operativa documentada', actor: 'buyer', required: true },
    { code: 'storageZone', label: 'Zona de almacenamiento definida', actor: 'buyer', required: false },
    { code: 'basicManagementPlan', label: 'Plan operativo de manejo', actor: 'buyer', required: false }
  ],
  4: [
    { code: 'company_ruc', label: 'RUC activo del comprador', actor: 'buyer', required: true },
    { code: 'eorsAuthorization', label: 'EO-RS para residuos críticos', actor: 'buyer', required: true },
    { code: 'matpelAuthorization', label: 'Autorización de transporte MATPEL', actor: 'buyer', required: true },
    { code: 'specializedStorage', label: 'Almacenamiento especializado', actor: 'buyer', required: true },
    { code: 'operationalTraceability', label: 'Trazabilidad integral', actor: 'buyer', required: true },
    { code: 'manifest', label: 'Manifiestos y control documental', actor: 'buyer', required: true },
    { code: 'emergencyProtocols', label: 'Protocolos de emergencia y contingencia', actor: 'buyer', required: true },
    { code: 'environmentalInsurance', label: 'Cobertura o seguro ambiental/operativo', actor: 'buyer', required: true },
    { code: 'operationalMonitoring', label: 'Monitoreo operativo y ambiental', actor: 'buyer', required: false }
  ]
};

export const REGULATORY_LEVEL_RULES: Record<1 | 2 | 3 | 4, RegulatoryLevelRule> = {
  1: {
    level: 1,
    title: 'Nivel 1 · Materiales libres',
    shortLabel: 'Nivel 1',
    riskLabel: 'Riesgo regulatorio bajo',
    traceabilityLabel: 'Trazabilidad básica',
    sellerRequirements: sellerRequirementsByLevel[1],
    buyerRequirements: buyerRequirementsByLevel[1],
    restrictions: [
      'No mezclar con residuos peligrosos, biocontaminados ni químicos.',
      'Mantener identificación clara del material y del punto de entrega.'
    ],
    relatedNorms: ['Formalización municipal', 'Control básico de origen y destino'],
    listingStatusLabel: 'Apto para negociación con control básico'
  },
  2: {
    level: 2,
    title: 'Nivel 2 · Residuos controlados',
    shortLabel: 'Nivel 2',
    riskLabel: 'Riesgo regulatorio medio',
    traceabilityLabel: 'Trazabilidad intermedia',
    sellerRequirements: sellerRequirementsByLevel[2],
    buyerRequirements: buyerRequirementsByLevel[2],
    restrictions: [
      'Registrar origen, volumen y frecuencia del material.',
      'Evitar comercialización sin clasificación básica cuando el volumen es recurrente.'
    ],
    relatedNorms: ['Control municipal/comercial', 'Buenas prácticas sanitarias y de almacenamiento'],
    listingStatusLabel: 'Apto con validación operativa adicional'
  },
  3: {
    level: 3,
    title: 'Nivel 3 · Residuos regulados',
    shortLabel: 'Nivel 3',
    riskLabel: 'Riesgo regulatorio alto',
    traceabilityLabel: 'Trazabilidad reforzada',
    sellerRequirements: sellerRequirementsByLevel[3],
    buyerRequirements: buyerRequirementsByLevel[3],
    restrictions: [
      'La negociación requiere trazabilidad documental de origen, traslado y destino.',
      'El comprador debe operar formalmente con almacenamiento seguro y valorización autorizada.'
    ],
    relatedNorms: ['Trazabilidad de RAEE/equivalentes', 'Valorización autorizada y control de almacenamiento'],
    listingStatusLabel: 'Negociación restringida con respaldo documental'
  },
  4: {
    level: 4,
    title: 'Nivel 4 · Residuos críticos',
    shortLabel: 'Nivel 4',
    riskLabel: 'Riesgo regulatorio crítico',
    traceabilityLabel: 'Trazabilidad integral',
    sellerRequirements: sellerRequirementsByLevel[4],
    buyerRequirements: buyerRequirementsByLevel[4],
    restrictions: [
      'No corresponde a marketplace abierto sin validación documental reforzada.',
      'Exige manifiestos, plan de manejo, control especializado y operadores habilitados.'
    ],
    relatedNorms: ['Gestión de residuos peligrosos/MATPEL', 'Manifiestos, trazabilidad y seguridad reforzada'],
    listingStatusLabel: 'No apto para compra sin validación crítica'
  }
};

const level4Keywords = [
  'peligroso',
  'quimic',
  'solvente',
  'hidrocarb',
  'aceite usado',
  'hospital',
  'biocontamin',
  'infect',
  'reactivo',
  'corrosivo',
  'toxico',
  'lodo industrial',
  'combustible',
  'matpel'
];

const level3Keywords = [
  'raee',
  'electron',
  'electrico',
  'bateria',
  'batería',
  'pila',
  'placa',
  'circuito',
  'toner',
  'monitor',
  'computadora',
  'cable'
];

const level1Keywords = [
  'papel',
  'carton',
  'cartón',
  'plastico',
  'plástico',
  'vidrio',
  'metal',
  'metales',
  'aluminio',
  'acero',
  'chatarra',
  'ferroso',
  'pet',
  'tetrapak'
];

export function classifyRegulatoryLevel(input: RegulatoryClassifyInput): RegulatoryLevel {
  const normalized = [
    input.residueType,
    input.sector,
    input.productType,
    input.specificResidue,
    input.title,
    input.description,
    input.restrictions
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (level4Keywords.some((keyword) => normalized.includes(keyword))) {
    return 4;
  }

  if (level3Keywords.some((keyword) => normalized.includes(keyword))) {
    return 3;
  }

  if (
    input.residueType === 'organic' ||
    input.sector === 'agriculture' ||
    input.sector === 'agroindustry' ||
    input.sector === 'food'
  ) {
    return 2;
  }

  if (level1Keywords.some((keyword) => normalized.includes(keyword))) {
    return 1;
  }

  return 2;
}

export function getRegulatoryRule(level: RegulatoryLevel): RegulatoryLevelRule {
  return REGULATORY_LEVEL_RULES[(level === 0 ? 1 : level) as 1 | 2 | 3 | 4];
}

export function getLevelBadgeClasses(level: RegulatoryLevel): string {
  switch (level) {
    case 1:
      return 'bg-emerald-100 text-emerald-700';
    case 2:
      return 'bg-amber-100 text-amber-700';
    case 3:
      return 'bg-orange-100 text-orange-700';
    case 4:
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function evaluateSellerCompliance(
  level: RegulatoryLevel,
  profile: Profile | null,
  compliance: SellerComplianceFlags,
  volume?: { quantity?: number | null; unit?: string | null }
): RegulatoryEvaluation {
  return evaluateRequirements(getRegulatoryRule(level), 'seller', profile, compliance, DEFAULT_BUYER_COMPLIANCE, volume);
}

export function evaluateBuyerCompliance(
  level: RegulatoryLevel,
  profile: Profile | null,
  compliance: BuyerComplianceFlags
): RegulatoryEvaluation {
  return evaluateRequirements(getRegulatoryRule(level), 'buyer', profile, DEFAULT_SELLER_COMPLIANCE, compliance);
}

export function getMaxEligibleSellerLevel(
  profile: Profile | null,
  compliance: SellerComplianceFlags,
  volume?: { quantity?: number | null; unit?: string | null }
): RegulatoryLevel {
  let maxLevel: RegulatoryLevel = 1;
  ([1, 2, 3, 4] as const).forEach((level) => {
    if (evaluateSellerCompliance(level, profile, compliance, volume).eligible) {
      maxLevel = level;
    }
  });
  return maxLevel;
}

export function getMaxEligibleBuyerLevel(profile: Profile | null, compliance: BuyerComplianceFlags): RegulatoryLevel {
  let maxLevel: RegulatoryLevel = 1;
  ([1, 2, 3, 4] as const).forEach((level) => {
    if (evaluateBuyerCompliance(level, profile, compliance).eligible) {
      maxLevel = level;
    }
  });
  return maxLevel;
}

function evaluateRequirements(
  rule: RegulatoryLevelRule,
  actor: 'seller' | 'buyer',
  profile: Profile | null,
  sellerCompliance: SellerComplianceFlags,
  buyerCompliance: BuyerComplianceFlags,
  volume?: { quantity?: number | null; unit?: string | null }
): RegulatoryEvaluation {
  const definitions = actor === 'seller' ? rule.sellerRequirements : rule.buyerRequirements;
  const allRequirements = definitions.map((definition) =>
    buildRequirementStatus(definition, profile, sellerCompliance, buyerCompliance, volume)
  );

  return {
    rule,
    missingRequired: allRequirements.filter((item) => item.required && item.status === 'missing'),
    recommendedPending: allRequirements.filter((item) => !item.required && item.status === 'recommended'),
    allRequirements,
    eligible: allRequirements.every((item) => !item.required || item.status === 'complete')
  };
}

function buildRequirementStatus(
  definition: RegulatoryRequirementDefinition,
  profile: Profile | null,
  sellerCompliance: SellerComplianceFlags,
  buyerCompliance: BuyerComplianceFlags,
  volume?: { quantity?: number | null; unit?: string | null }
): RegulatoryRequirementStatus {
  const completed = resolveRequirementCompletion(definition.code, profile, sellerCompliance, buyerCompliance, volume);
  const status: RegulatoryStatus = completed ? 'complete' : definition.required ? 'missing' : 'recommended';
  return { ...definition, status };
}

function resolveRequirementCompletion(
  code: string,
  profile: Profile | null,
  sellerCompliance: SellerComplianceFlags,
  buyerCompliance: BuyerComplianceFlags,
  volume?: { quantity?: number | null; unit?: string | null }
): boolean {
  const company = profile?.company;
  const person = profile?.personProfile;
  const hasAddress = Boolean((company?.address ?? person?.address ?? '').trim());

  switch (code) {
    case 'identity_or_ruc':
      return Boolean(company?.ruc || person?.documentNumber);
    case 'company_ruc':
      return Boolean(company?.ruc);
    case 'address':
      return hasAddress;
    case 'commercial_ruc_if_volume':
      return !isCommercialVolume(volume) || Boolean(company?.ruc);
    case 'municipalLicense':
      return sellerCompliance.municipalLicense || buyerCompliance.municipalLicense;
    case 'sanitaryPermit':
      return sellerCompliance.sanitaryPermit;
    case 'storageAuthorization':
      return sellerCompliance.storageAuthorization;
    case 'originDeclaration':
      return sellerCompliance.originDeclaration;
    case 'wasteClassification':
      return sellerCompliance.wasteClassification;
    case 'commercialRegistration':
      return sellerCompliance.commercialRegistration;
    case 'internalInventory':
      return sellerCompliance.internalInventory;
    case 'manifest':
      return sellerCompliance.manifest || buyerCompliance.manifest;
    case 'managementPlan':
      return sellerCompliance.managementPlan;
    case 'safetyProtocols':
      return sellerCompliance.safetyProtocols;
    case 'formalOperationEvidence':
      return buyerCompliance.formalOperationEvidence;
    case 'collectionCenter':
      return buyerCompliance.collectionCenter;
    case 'sanitaryAuthorization':
      return buyerCompliance.sanitaryAuthorization;
    case 'storageZone':
      return buyerCompliance.storageZone;
    case 'basicManagementPlan':
      return buyerCompliance.basicManagementPlan;
    case 'eorsAuthorization':
      return buyerCompliance.eorsAuthorization;
    case 'valorizationAuthorization':
      return buyerCompliance.valorizationAuthorization;
    case 'safeStorage':
      return buyerCompliance.safeStorage;
    case 'specializedStorage':
      return buyerCompliance.specializedStorage;
    case 'operationalTraceability':
      return buyerCompliance.operationalTraceability;
    case 'matpelAuthorization':
      return buyerCompliance.matpelAuthorization;
    case 'emergencyProtocols':
      return buyerCompliance.emergencyProtocols;
    case 'environmentalInsurance':
      return buyerCompliance.environmentalInsurance;
    case 'operationalMonitoring':
      return buyerCompliance.operationalMonitoring;
    default:
      return false;
  }
}

function isCommercialVolume(volume?: { quantity?: number | null; unit?: string | null }): boolean {
  const quantity = volume?.quantity ?? 0;
  const unit = volume?.unit ?? 'kg';

  if (unit === 'tons') {
    return quantity >= 1;
  }

  if (unit === 'kg') {
    return quantity >= 1000;
  }

  if (unit === 'm3') {
    return quantity >= 1;
  }

  return false;
}
