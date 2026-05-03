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
        Guid? listingId = null,
        CancellationToken cancellationToken = default);

    ListingPreviewDto Preview(WasteSellRequestDto request);

    Task<MarketplaceListingsPageDto> GetMarketplaceListingsAsync(
        int page,
        int pageSize,
        string? query,
        string? sortBy,
        string? wasteType,
        string? sector,
        string? productType,
        string? specificResidue,
        string? exchangeType,
        string? location,
        decimal? minPrice,
        decimal? maxPrice,
        string? deliveryMode,
        bool? immediateOnly,
        string? residueCondition,
        CancellationToken cancellationToken = default);

    Task<ListingDetailDto?> GetListingDetailAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<MarketplaceListingDto>> GetMyListingsAsync(
        Guid sellerId,
        CancellationToken cancellationToken = default);

    Task<WasteSellResponseDto?> GetMyListingForEditAsync(
        Guid sellerId,
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<bool> CancelMyListingAsync(
        Guid sellerId,
        Guid listingId,
        CancellationToken cancellationToken = default);
}
