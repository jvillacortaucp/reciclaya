using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Application.ValueSectors.Services;
using ReciclaYa.Application.ValorizationIdeas.Dtos;
using ReciclaYa.Application.ValorizationIdeas.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/listings/{listingId:guid}/valorization-ideas")]
public sealed class ValorizationIdeasController(
    IValorizationIdeaService valorizationIdeaService,
    IValueSectorService valueSectorService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(Guid listingId, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var ideas = await valorizationIdeaService.GetByListingAsync(listingId, cancellationToken);
        return ideas is null
            ? NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]))
            : Ok(ApiResponse<IReadOnlyCollection<ValorizationIdeaDto>>.Ok(ideas));
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        Guid listingId,
        [FromQuery] string? responseShape,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        if (string.Equals(responseShape, "value-sector", StringComparison.OrdinalIgnoreCase))
        {
            var generated = await valueSectorService.GenerateFromListingAsync(listingId, null, null, cancellationToken);
            return generated is null
                ? NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]))
                : Ok(ApiResponse<ValueSectorFromListingResponseDto>.Ok(generated, "Value sector routes generated."));
        }

        var ideas = await valorizationIdeaService.GenerateAsync(listingId, cancellationToken);
        return ideas is null
            ? NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]))
            : Ok(ApiResponse<IReadOnlyCollection<ValorizationIdeaDto>>.Ok(ideas, "Valorization ideas generated."));
    }

    private static bool CanAccess(string role)
    {
        return string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId)
            && !string.IsNullOrWhiteSpace(role);
    }
}
