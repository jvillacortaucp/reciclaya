using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/my-listings")]
public sealed class MyListingsController(IListingService listingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyListings(CancellationToken cancellationToken)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        if (!TryGetUserId(out var userId))
        {
            return InvalidToken();
        }

        var response = await listingService.GetMyListingsAsync(userId, cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<MarketplaceListingDto>>.Ok(response));
    }

    [HttpGet("{id:guid}/edit-state")]
    public async Task<IActionResult> GetEditState(Guid id, CancellationToken cancellationToken)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        if (!TryGetUserId(out var userId))
        {
            return InvalidToken();
        }

        var response = await listingService.GetMyListingForEditAsync(userId, id, cancellationToken);
        if (response is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<WasteSellResponseDto>.Ok(response));
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        if (!TryGetUserId(out var userId))
        {
            return InvalidToken();
        }

        var cancelled = await listingService.CancelMyListingAsync(userId, id, cancellationToken);
        if (!cancelled)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<object>.Ok(new { cancelled = true }, "Listing cancelled."));
    }

    private bool CanManageListings()
    {
        var role = User.FindFirst("role")?.Value;

        return string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(subject, out userId);
    }

    private IActionResult InvalidToken()
    {
        return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
    }

    private IActionResult Forbidden()
    {
        return StatusCode(
            StatusCodes.Status403Forbidden,
            ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
    }
}
