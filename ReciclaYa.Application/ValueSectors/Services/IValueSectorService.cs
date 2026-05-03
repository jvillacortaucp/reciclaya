using ReciclaYa.Application.ValueSectors.Dtos;

namespace ReciclaYa.Application.ValueSectors.Services;

public interface IValueSectorService
{
    Task<bool> ListingExistsAsync(
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<bool> IsListingOwnedByAsync(
        Guid listingId,
        Guid sellerId,
        CancellationToken cancellationToken = default);

    Task<ValueSectorListingSummaryDto?> GetListingSummaryAsync(
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<ValueSectorPageResponseDto> GetPageAsync(
        ValueSectorQueryDto query,
        CancellationToken cancellationToken = default);

    Task<ValueSectorRouteDto?> GetRouteAsync(
        string routeId,
        CancellationToken cancellationToken = default);

    Task<ValueRouteDetailDto?> GetProductDetailAsync(
        string productId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ValueSectorRouteDto>> PreviewAsync(
        ValueSectorPreviewRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ValueSectorFromListingResponseDto?> GetFromListingAsync(
        Guid listingId,
        bool useAi = true,
        int? limit = null,
        CancellationToken cancellationToken = default);

    Task<ValueSectorFromListingResponseDto?> GenerateFromListingAsync(
        Guid listingId,
        ValueSectorGenerateRequestDto? request = null,
        int? limit = null,
        CancellationToken cancellationToken = default);
}
