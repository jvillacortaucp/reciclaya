namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorFromListingResponseDto(
    ValueSectorListingSummaryDto Listing,
    IReadOnlyCollection<ValueSectorRouteDto> Routes);

public sealed record ValueSectorListingSummaryDto(
    Guid Id,
    string SpecificResidue,
    string ProductType,
    string WasteType,
    string Sector,
    string Description,
    string Condition,
    decimal Quantity,
    string Unit,
    string Location,
    string ExchangeType,
    string Status);
