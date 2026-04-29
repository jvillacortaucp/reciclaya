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
        [FromQuery] string? wasteType = null,
        [FromQuery] string? sector = null,
        [FromQuery] string? productType = null,
        CancellationToken cancellationToken = default)
    {
        var response = await listingService.GetMarketplaceListingsAsync(
            page,
            pageSize,
            query,
            wasteType,
            sector,
            productType,
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
