namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorPageResponseDto(
    IReadOnlyCollection<ValueSectorRouteDto> Items,
    int Total,
    int Page,
    int PageSize,
    bool HasMore);
