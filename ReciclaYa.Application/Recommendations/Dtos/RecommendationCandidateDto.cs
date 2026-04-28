namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationCandidateDto(
    Guid ListingId,
    string Title,
    string WasteType,
    string Sector,
    string ProductType,
    string SpecificResidue,
    string Description,
    decimal Quantity,
    string Unit,
    decimal? PricePerUnitUsd,
    string Condition,
    string Location,
    string ExchangeType,
    string DeliveryMode,
    bool ImmediateAvailability,
    int? MatchScore);
