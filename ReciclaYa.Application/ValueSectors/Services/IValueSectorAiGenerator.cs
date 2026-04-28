using ReciclaYa.Application.ValueSectors.Dtos;

namespace ReciclaYa.Application.ValueSectors.Services;

public interface IValueSectorAiGenerator
{
    Task<IReadOnlyCollection<ValueSectorRouteDto>> GenerateRoutesAsync(
        ValueSectorPreviewRequestDto context,
        int limit,
        string? regenerationSeed = null,
        IReadOnlyCollection<string>? excludeRouteIds = null,
        IReadOnlyCollection<string>? excludeProductIds = null,
        CancellationToken cancellationToken = default);
}
