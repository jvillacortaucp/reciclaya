namespace ReciclaYa.Application.PurchasePreferences.Dtos;

public sealed record PurchasePreferenceRequestDto(
    DesiredResidueDto DesiredResidue,
    SourcingPreferencesDto Sourcing,
    LogisticsPreferencesDto Logistics,
    AlertPreferencesDto Alerts);

public sealed record PurchasePreferenceResponseDto(
    PurchasePreferenceFormValueDto FormValue,
    ProfileStatusDto ProfileStatus,
    MatchProjectionDto Projection,
    string SmartRecommendationNote,
    DateTime? DraftSavedAt);

public sealed record PurchasePreferenceFormValueDto(
    DesiredResidueDto DesiredResidue,
    SourcingPreferencesDto Sourcing,
    LogisticsPreferencesDto Logistics,
    AlertPreferencesDto Alerts);

public sealed record DesiredResidueDto(
    string ResidueType,
    string Sector,
    string ProductType,
    string SpecificResidue);

public sealed record SourcingPreferencesDto(
    decimal RequiredVolume,
    string Unit,
    string PurchaseFrequency,
    decimal? MinPriceUsd,
    decimal? MaxPriceUsd,
    string DesiredCondition);

public sealed record LogisticsPreferencesDto(
    string ReceivingLocation,
    int RadiusKm,
    string PreferredMode,
    string AcceptedExchangeType);

public sealed record AlertPreferencesDto(
    string Notes,
    bool AlertOnMatch,
    string Priority);

public sealed record ProfileStatusDto(
    int CompletionPercentage,
    string Title,
    string Subtitle,
    string Recommendation);

public sealed record MatchProjectionDto(
    int SuppliersCount,
    int DirectMatchCount,
    int PotentialMatchCount,
    string ProjectedSavingsLabel);

public sealed record PurchasePreferenceSummaryDto(
    string MaterialLabel,
    string VolumeLabel,
    string LogisticsLabel,
    string UrgencyLabel);
