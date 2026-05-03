namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorGenerateRequestDto(
    string? RegenerationSeed,
    IReadOnlyCollection<string>? ExcludeRouteIds,
    IReadOnlyCollection<string>? ExcludeProductIds);
