namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationDto(
    string Id,
    Guid ListingId,
    string Title,
    string Reason,
    int ConfidenceScore,
    string Source,
    string? WasteType = null,
    string? Sector = null,
    string? ProductType = null,
    decimal? PricePerUnitUsd = null,
    string? Location = null,
    string? SuggestedAction = null,
    string? BuyerBenefit = null,
    string? RecommendedUse = null,
    IReadOnlyCollection<string>? PotentialProducts = null,
    IReadOnlyCollection<string>? RequiredConditions = null,
    IReadOnlyCollection<string>? Risks = null,
    string? NextStep = null,
    string? ViabilityLevel = null);
