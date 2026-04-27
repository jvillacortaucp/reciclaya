namespace ReciclaYa.Application.Listings.Dtos;

public sealed record WasteSellRequestDto(
    WasteListingFormValueDto FormValue,
    string? DraftSavedAt,
    string? AiSuggestionNote);

public sealed record WasteSellResponseDto(
    WasteListingFormValueDto FormValue,
    string? DraftSavedAt,
    string AiSuggestionNote);

public sealed record WasteListingFormValueDto(
    string ResidueType,
    string Sector,
    string ProductType,
    string SpecificResidue,
    string ShortDescription,
    WasteVolumeDto Volume,
    WasteLogisticsDto Logistics,
    WasteAdditionalDto Additional,
    IReadOnlyCollection<WasteMediaUploadDto> MediaUploads);

public sealed record WasteVolumeDto(
    decimal Quantity,
    string Unit,
    string GenerationFrequency,
    decimal EstimatedCostPerUnit);

public sealed record WasteLogisticsDto(
    string WarehouseAddress,
    string MaxStorageTime,
    string ExchangeType,
    string DeliveryMode,
    bool ImmediateAvailability);

public sealed record WasteAdditionalDto(
    string Condition,
    string RestrictionsNotes,
    string NextAvailabilityDate);

public sealed record WasteMediaUploadDto(
    string Id,
    string Name,
    string PreviewUrl,
    int SizeKb,
    string Type);
