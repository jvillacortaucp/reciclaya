using ReciclaYa.Application.Listings.Dtos;

namespace ReciclaYa.Application.Listings.Services;

public interface IListingService
{
    Task<WasteSellResponseDto> SaveDraftAsync(
        Guid sellerId,
        WasteSellRequestDto request,
        CancellationToken cancellationToken = default);

    Task PublishAsync(
        Guid sellerId,
        WasteSellRequestDto request,
        CancellationToken cancellationToken = default);

    ListingPreviewDto Preview(WasteSellRequestDto request);

    Task<MarketplaceListingsPageDto> GetMarketplaceListingsAsync(
        int page,
        int pageSize,
        string? wasteType,
        string? sector,
        string? productType,
        CancellationToken cancellationToken = default);

    Task<ListingDetailDto?> GetListingDetailAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<MarketplaceListingDto>> GetMyListingsAsync(
        Guid sellerId,
        CancellationToken cancellationToken = default);
}
