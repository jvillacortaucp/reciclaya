namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationPreferenceDto(
    string? ResidueType,
    string? Sector,
    string? ProductType,
    string? SpecificResidue,
    decimal? RequiredVolume,
    string? Unit,
    decimal? MinPriceUsd,
    decimal? MaxPriceUsd,
    string? DesiredCondition,
    string? ReceivingLocation,
    int? RadiusKm,
    string? AcceptedExchangeType,
    string? PreferredMode,
    string? Notes,
    string? Priority);
