using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/waste-sell")]
public sealed class WasteSellController(IListingService listingService) : ControllerBase
{
    [HttpPut("draft")]
    public async Task<IActionResult> SaveDraft(
        [FromBody] WasteSellRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        if (!TryGetUserId(out var userId))
        {
            return InvalidToken();
        }

        var response = await listingService.SaveDraftAsync(userId, request, cancellationToken);

        return Ok(ApiResponse<WasteSellResponseDto>.Ok(response, "Draft saved."));
    }

    [HttpPost("publish")]
    public async Task<IActionResult> Publish(
        [FromBody] WasteSellRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        if (!TryGetUserId(out var userId))
        {
            return InvalidToken();
        }

        await listingService.PublishAsync(userId, request, cancellationToken);

        return Ok(ApiResponse<object>.Ok(new { published = true }, "Listing published."));
    }

    [HttpPost("preview")]
    public IActionResult Preview([FromBody] WasteSellRequestDto request)
    {
        if (!CanManageListings())
        {
            return Forbidden();
        }

        var response = listingService.Preview(request);

        return Ok(ApiResponse<ListingPreviewDto>.Ok(response));
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
