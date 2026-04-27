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
