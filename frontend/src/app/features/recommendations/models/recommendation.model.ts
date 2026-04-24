export type RecommendationTab = 'process' | 'explanation' | 'market';
export type CostView = 'percent' | 'usd';
export type ChartType = 'donut' | 'bar';

export type ComplexityLevel = 'low' | 'medium' | 'high';
export type MarketPotentialLevel = 'low' | 'medium' | 'high';
export type StepRiskLevel = 'low' | 'medium' | 'high';

export type ProcessStepIconName =
  | 'package-search'
  | 'droplets'
  | 'wind'
  | 'factory'
  | 'scan-line'
  | 'package'
  | 'archive';

export interface ManufacturingProcessStep {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly shortDescription: string;
  readonly estimatedTime: string;
  readonly requiredEquipment: readonly string[];
  readonly keyActions: readonly string[];
  readonly quickTip: string;
  readonly riskLevel: StepRiskLevel;
  readonly iconName: ProcessStepIconName;
}

export interface EnvironmentalFactors {
  readonly positive: readonly string[];
  readonly negative: readonly string[];
}

export interface ExplanationStep {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly shortLabel: string;
  readonly transformationType: string;
  readonly whatHappens: string;
  readonly whyItMatters: string;
  readonly transformationOutcome: string;
  readonly quickTip: string;
  readonly avoidRisk: string;
  readonly processImageUrl: string;
  readonly environmentalFactors: EnvironmentalFactors;
  readonly natureBenefits: readonly string[];
  readonly iconName: ProcessStepIconName;
}

export interface EnvironmentalSummary {
  readonly impactScore: number;
  readonly utilizationLevelLabel: string;
  readonly utilizationPercent: number;
  readonly environmentalRiskLabel: string;
  readonly environmentalRiskPercent: number;
  readonly keyRecommendation: string;
}

export interface RecommendationProcess {
  readonly recommendationId: string;
  readonly recommendedProduct: string;
  readonly baseResidue: string;
  readonly complexity: ComplexityLevel;
  readonly totalEstimatedTime: string;
  readonly approximateCost: string;
  readonly marketPotential: MarketPotentialLevel;
  readonly principalEquipment: readonly string[];
  readonly expectedOutcome: string;
  readonly explanation: string;
  readonly explanationSteps: readonly ExplanationStep[];
  readonly environmentalSummary: EnvironmentalSummary;
  readonly marketAnalysis: RecommendationMarketAnalysis;
  readonly processSteps: readonly ManufacturingProcessStep[];
}

export interface BuyerSegment {
  readonly id: string;
  readonly name: string;
  readonly segment: string;
  readonly monthlyVolume: string;
  readonly probability: number;
  readonly channel: string;
  readonly type: 'enterprise' | 'retail' | 'consumer';
  readonly iconName: 'building' | 'store' | 'leaf';
}

export interface MarketKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly trendPercent: number;
  readonly tone: 'emerald' | 'slate' | 'amber';
}

export interface CostStructureItem {
  readonly id: string;
  readonly label: string;
  readonly amountUsd: number;
  readonly percent: number;
}

export interface CompetitionInsight {
  readonly competitionLevelLabel: string;
  readonly directSubstitutes: readonly string[];
  readonly positioningRecommendation: string;
}

export interface MarketOpportunitySummary {
  readonly generatedAt: string;
  readonly initialInvestment: string;
  readonly paybackPeriod: string;
  readonly monthlyProfitability: string;
  readonly sustainabilityScore: string;
  readonly nextSteps: readonly string[];
  readonly ecoTip: string;
}

export interface FinishedProductMarketCard {
  readonly name: string;
  readonly useCase: string;
  readonly suggestedFormat: string;
  readonly suggestedPricePerKg: number;
  readonly opportunityTag: string;
  readonly productImageUrl: string;
}

export interface RecommendationMarketAnalysis {
  readonly finishedProduct: FinishedProductMarketCard;
  readonly potentialBuyers: readonly BuyerSegment[];
  readonly marketKpis: readonly MarketKpi[];
  readonly costStructure: readonly CostStructureItem[];
  readonly estimatedGrossMarginPercent: number;
  readonly suggestedPricePerKg: number;
  readonly totalCostPerKg: number;
  readonly competitionInsight: CompetitionInsight;
  readonly opportunitySummary: MarketOpportunitySummary;
  readonly chartLabels: readonly string[];
  readonly chartSeries: readonly number[];
}
