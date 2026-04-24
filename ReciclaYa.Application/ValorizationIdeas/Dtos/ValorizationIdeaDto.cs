namespace ReciclaYa.Application.ValorizationIdeas.Dtos;

public sealed record ValorizationIdeaDto(
    Guid? Id,
    string Title,
    string Summary,
    string SuggestedProduct,
    string ProcessOverview,
    IReadOnlyCollection<string> PotentialBuyers,
    IReadOnlyCollection<string> RequiredConditions,
    string SellerRecommendation,
    string BuyerRecommendation,
    string RecommendedStrategy,
    string ViabilityLevel,
    string EstimatedImpact,
    IReadOnlyCollection<string> Warnings,
    string Source);
