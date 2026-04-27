namespace ReciclaYa.Application.Listings.Dtos;

public sealed record ListingDetailDto(
    string Id,
    string ReferenceCode,
    string Title,
    string Subtitle,
    string ProductType,
    string SpecificResidueType,
    string WasteType,
    string Sector,
    string Status,
    string Description,
    string Condition,
    string Restrictions,
    string SellerName,
    string SellerVerificationLabel,
    IReadOnlyCollection<ListingMediaDto> Media,
    ListingDetailVolumeDto Volume,
    ListingDetailPricingDto Pricing,
    ListingDetailLogisticsDto Logistics,
    IReadOnlyCollection<ListingTechnicalSpecDto> TechnicalSpecs,
    IReadOnlyCollection<RelatedListingPreviewDto> RelatedListings);

public sealed record ListingDetailVolumeDto(
    decimal Amount,
    string Unit,
    string GenerationFrequency);

public sealed record ListingDetailPricingDto(
    string Currency,
    decimal CostPerUnit,
    decimal EstimatedTotal,
    bool Negotiable);

public sealed record ListingDetailLogisticsDto(
    string Location,
    string DeliveryMode,
    string ExchangeType,
    bool ImmediateAvailability,
    string MaxStorageTime,
    string LogisticsNotes);

public sealed record ListingTechnicalSpecDto(
    string Key,
    string Label,
    string Value);

public sealed record RelatedListingPreviewDto(
    string Id,
    string Title,
    string Location,
    string QuantityLabel,
    string PriceLabel,
    string MediaUrl);
