namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueRouteDetailDto(
    string RecommendationId,
    string RecommendedProduct,
    string BaseResidue,
    string Complexity,
    string TotalEstimatedTime,
    string ApproximateCost,
    string MarketPotential,
    IReadOnlyCollection<string> PrincipalEquipment,
    string ExpectedOutcome,
    string Explanation,
    IReadOnlyCollection<ValueRouteExplanationStepDto> ExplanationSteps,
    ValueRouteEnvironmentalSummaryDto EnvironmentalSummary,
    ValueRouteMarketAnalysisDto MarketAnalysis,
    IReadOnlyCollection<ValueRouteProcessStepDto> ProcessSteps,
    string? Source = null,
    string? ManufacturingProcess = null,
    ValueRouteComplexityOverviewDto? ComplexityOverview = null);

public sealed record ValueRouteComplexityOverviewDto(
    string? ProcessingRequired,
    string? EquipmentNeeded,
    string? TechnicalKnowledge,
    string? TransformationTime,
    string? EstimatedCost,
    string? OperationalRisk,
    string? PositiveEnvironmentalImpact);

public sealed record ValueRouteProcessStepDto(
    string Id,
    int Order,
    string Title,
    string ShortDescription,
    string EstimatedTime,
    IReadOnlyCollection<string> RequiredEquipment,
    IReadOnlyCollection<string> KeyActions,
    string QuickTip,
    string RiskLevel,
    string IconName);

public sealed record ValueRouteExplanationStepDto(
    string Id,
    int Order,
    string Title,
    string ShortLabel,
    string TransformationType,
    string WhatHappens,
    string WhyItMatters,
    string TransformationOutcome,
    string QuickTip,
    string AvoidRisk,
    string ProcessImageUrl,
    ValueRouteEnvironmentalFactorsDto EnvironmentalFactors,
    IReadOnlyCollection<string> NatureBenefits,
    string IconName);

public sealed record ValueRouteEnvironmentalFactorsDto(
    IReadOnlyCollection<string> Positive,
    IReadOnlyCollection<string> Negative);

public sealed record ValueRouteEnvironmentalSummaryDto(
    decimal ImpactScore,
    string UtilizationLevelLabel,
    int UtilizationPercent,
    string EnvironmentalRiskLabel,
    int EnvironmentalRiskPercent,
    string KeyRecommendation);

public sealed record ValueRouteMarketAnalysisDto(
    ValueRouteFinishedProductDto FinishedProduct,
    IReadOnlyCollection<ValueRouteBuyerSegmentDto> PotentialBuyers,
    IReadOnlyCollection<ValueRouteMarketKpiDto> MarketKpis,
    IReadOnlyCollection<ValueRouteCostStructureItemDto> CostStructure,
    decimal EstimatedGrossMarginPercent,
    decimal SuggestedPricePerKg,
    decimal TotalCostPerKg,
    ValueRouteCompetitionInsightDto CompetitionInsight,
    ValueRouteOpportunitySummaryDto OpportunitySummary,
    IReadOnlyCollection<string> ChartLabels,
    IReadOnlyCollection<decimal> ChartSeries);

public sealed record ValueRouteFinishedProductDto(
    string Name,
    string UseCase,
    string SuggestedFormat,
    decimal SuggestedPricePerKg,
    string OpportunityTag,
    string ProductImageUrl);

public sealed record ValueRouteBuyerSegmentDto(
    string Id,
    string Name,
    string Segment,
    string MonthlyVolume,
    int Probability,
    string Channel,
    string Type,
    string IconName);

public sealed record ValueRouteMarketKpiDto(
    string Id,
    string Label,
    string Value,
    string Helper,
    int TrendPercent,
    string Tone);

public sealed record ValueRouteCostStructureItemDto(
    string Id,
    string Label,
    decimal AmountUsd,
    int Percent);

public sealed record ValueRouteCompetitionInsightDto(
    string CompetitionLevelLabel,
    IReadOnlyCollection<string> DirectSubstitutes,
    string PositioningRecommendation);

public sealed record ValueRouteOpportunitySummaryDto(
    string GeneratedAt,
    string InitialInvestment,
    string PaybackPeriod,
    string MonthlyProfitability,
    string SustainabilityScore,
    IReadOnlyCollection<string> NextSteps,
    string EcoTip);
