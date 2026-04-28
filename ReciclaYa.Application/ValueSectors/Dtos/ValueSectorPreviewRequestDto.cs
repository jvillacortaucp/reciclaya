namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorPreviewRequestDto(
    string? ResidueType,
    string? Sector,
    string? ProductType,
    string? SpecificResidue,
    string? Description,
    string? Condition,
    decimal? Quantity,
    string? Unit,
    string? Location,
    string? ExchangeType,
    bool UseAi = true);

public sealed record ValueSectorQueryDto(
    string? Sector = null,
    string? ResidueType = null,
    string? ProductType = null,
    string? SpecificResidue = null,
    Guid? ListingId = null,
    bool UseAi = true,
    int? Limit = null,
    int Page = 1,
    int PageSize = 4);
