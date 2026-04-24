using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/marketplace")]
public sealed class MarketplaceController(IListingService listingService) : ControllerBase
{
    [HttpGet("listings")]
    public async Task<IActionResult> GetListings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? wasteType = null,
        [FromQuery] string? sector = null,
        [FromQuery] string? productType = null,
        CancellationToken cancellationToken = default)
    {
        var response = await listingService.GetMarketplaceListingsAsync(
            page,
            pageSize,
            wasteType,
            sector,
            productType,
            cancellationToken);

        return Ok(ApiResponse<MarketplaceListingsPageDto>.Ok(response));
    }

    [HttpGet("listings/{id:guid}")]
    public async Task<IActionResult> GetListingDetail(
        Guid id,
        CancellationToken cancellationToken)
    {
        var response = await listingService.GetListingDetailAsync(id, cancellationToken);

        if (response is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ListingDetailDto>.Ok(response));
    }
}
