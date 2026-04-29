using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/marketplace/products")]
public sealed class PublicMarketplaceController(IListingService listingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? query = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? wasteType = null,
        [FromQuery] string? sector = null,
        [FromQuery] string? productType = null,
        [FromQuery] string? specificResidue = null,
        [FromQuery] string? exchangeType = null,
        [FromQuery] string? location = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? deliveryMode = null,
        [FromQuery] bool? immediateOnly = null,
        [FromQuery] string? residueCondition = null,
        CancellationToken cancellationToken = default)
    {
        var response = await listingService.GetMarketplaceListingsAsync(
            page,
            pageSize,
            query,
            sortBy,
            wasteType,
            sector,
            productType,
            specificResidue,
            exchangeType,
            location,
            minPrice,
            maxPrice,
            deliveryMode,
            immediateOnly,
            residueCondition,
            cancellationToken);

        return Ok(ApiResponse<MarketplaceListingsPageDto>.Ok(response));
    }

    [HttpGet("{productId:guid}")]
    public async Task<IActionResult> GetProductDetail(Guid productId, CancellationToken cancellationToken)
    {
        var response = await listingService.GetListingDetailAsync(productId, cancellationToken);
        if (response is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ListingDetailDto>.Ok(response));
    }
}
