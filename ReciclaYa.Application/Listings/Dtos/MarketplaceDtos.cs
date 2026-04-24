namespace ReciclaYa.Application.Listings.Dtos;

public sealed record MarketplaceListingDto(
    string Id,
    string ProductType,
    string SpecificResidue,
    string WasteType,
    string Sector,
    decimal Quantity,
    string Unit,
    string Location,
    string ExchangeType,
    string DeliveryMode,
    bool ImmediateAvailability,
    string ResidueCondition,
    decimal? PricePerUnitUsd,
    string Status,
    int MatchScore,
    string CreatedAt,
    IReadOnlyCollection<ListingMediaDto> Media);

public sealed record MarketplaceListingsPageDto(
    IReadOnlyCollection<MarketplaceListingDto> Items,
    int Total,
    int Page,
    int PageSize,
    bool HasMore);

public sealed record ListingMediaDto(
    string Id,
    string Url,
    string Alt);
