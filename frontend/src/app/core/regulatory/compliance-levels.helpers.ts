import { COMPLIANCE_LEVEL_DEFINITIONS } from './compliance-levels.constants';
import { StoredComplianceLevelsState } from './compliance-levels.models';
import { RegulatoryClassifyInput, RegulatoryLevel } from './regulatory.models';
import { classifyRegulatoryLevel } from './regulatory.rules';

const LEVEL_ORDER_DESC: readonly RegulatoryLevel[] = [4, 3, 2, 1];

export function resolveCurrentComplianceLevel(state: StoredComplianceLevelsState): RegulatoryLevel {
  let currentLevel: RegulatoryLevel = 0;

  for (const level of COMPLIANCE_LEVEL_DEFINITIONS) {
    const requiredApproved = level.requirementsForUpload.every((requirement) => {
      const status = state.requirements[requirement.id]?.currentStatus ?? requirement.currentStatus;
      return !requirement.required || status === 'approved';
    });

    if (!requiredApproved) {
      break;
    }

    currentLevel = level.id;
  }

  return currentLevel;
}

export function resolveRequiredComplianceLevel(input: RegulatoryClassifyInput): RegulatoryLevel {
  const haystack = normalizeText(
    [
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
  );

  if (!haystack) {
    return classifyRegulatoryLevel(input);
  }

  for (const levelId of LEVEL_ORDER_DESC) {
    const level = COMPLIANCE_LEVEL_DEFINITIONS.find((item) => item.id === levelId);
    if (!level) {
      continue;
    }

    const matched = level.includedWasteCategories.some((category) => {
      const tokens = [category.title, ...category.examples]
        .map((token) => normalizeText(token))
        .filter(Boolean);

      return tokens.some((token) => haystack.includes(token));
    });

    if (matched) {
      return levelId;
    }
  }

  return classifyRegulatoryLevel(input);
}

export function canOperateComplianceLevel(
  currentUserLevel: RegulatoryLevel,
  requiredLevel: RegulatoryLevel
): boolean {
  return currentUserLevel >= requiredLevel;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
