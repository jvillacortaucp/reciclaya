using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Application.ValueSectors.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/value-sectors")]
public sealed class ValueSectorsController(
    IValueSectorService valueSectorService,
    ILogger<ValueSectorsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] string? sector = null,
        [FromQuery] string? residueType = null,
        [FromQuery] string? productType = null,
        [FromQuery] string? specificResidue = null,
        [FromQuery] Guid? listingId = null,
        [FromQuery] bool useAi = true,
        [FromQuery] int? limit = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 4,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRole(out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await valueSectorService.GetPageAsync(
            new ValueSectorQueryDto(
                sector,
                residueType,
                productType,
                specificResidue,
                listingId,
                useAi,
                limit,
                page,
                pageSize),
            cancellationToken);

        return Ok(ApiResponse<ValueSectorPageResponseDto>.Ok(response));
    }

    [HttpGet("{routeId}")]
    public async Task<IActionResult> GetRoute(
        string routeId,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRole(out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var route = await valueSectorService.GetRouteAsync(routeId, cancellationToken);
        if (route is null)
        {
            return NotFound(ApiResponse<object>.Fail("Value sector route not found.", ["VALUE_SECTOR_ROUTE_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ValueSectorRouteDto>.Ok(route));
    }

    [HttpGet("products/{productId}")]
    public async Task<IActionResult> GetProductDetail(
        string productId,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRole(out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var detail = await valueSectorService.GetProductDetailAsync(productId, cancellationToken);
        if (detail is null)
        {
            return NotFound(ApiResponse<object>.Fail("Value sector product not found.", ["VALUE_SECTOR_PRODUCT_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ValueRouteDetailDto>.Ok(detail));
    }

    [HttpPost("preview")]
    public async Task<IActionResult> Preview(
        [FromBody] ValueSectorPreviewRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRole(out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var routes = await valueSectorService.PreviewAsync(request, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<ValueSectorRouteDto>>.Ok(routes));
    }

    [HttpGet("from-listing/{listingId:guid}")]
    public async Task<IActionResult> GetFromListing(
        Guid listingId,
        [FromQuery] bool useAi = true,
        [FromQuery] int? limit = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRoleAndSubject(out var role, out var subject))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var listing = await valueSectorService.GetListingSummaryAsync(listingId, cancellationToken);
        if (listing is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        var canReadListing = await CanReadListing(role, subject, listing, listingId, cancellationToken);
        if (!canReadListing)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        logger.LogInformation(
            "ValueSector GET from-listing. ListingId={ListingId}, Role={Role}, ListingStatus={ListingStatus}, UseAi={UseAi}",
            listingId,
            role,
            listing.Status,
            useAi);

        var response = await valueSectorService.GetFromListingAsync(
            listingId,
            useAi,
            limit,
            cancellationToken);

        return Ok(ApiResponse<ValueSectorFromListingResponseDto>.Ok(response!));
    }

    [HttpPost("from-listing/{listingId:guid}/generate")]
    public async Task<IActionResult> GenerateFromListing(
        Guid listingId,
        [FromBody] ValueSectorGenerateRequestDto? request,
        [FromQuery] int? limit = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserRoleAndSubject(out var role, out var subject))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanAccess(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var listing = await valueSectorService.GetListingSummaryAsync(listingId, cancellationToken);
        if (listing is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        var canReadListing = await CanReadListing(role, subject, listing, listingId, cancellationToken);
        if (!canReadListing)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        logger.LogInformation(
            "ValueSector POST generate. ListingId={ListingId}, Role={Role}, ListingStatus={ListingStatus}, Limit={Limit}, Seed={Seed}",
            listingId,
            role,
            listing.Status,
            limit,
            request?.RegenerationSeed);

        var response = await valueSectorService.GenerateFromListingAsync(listingId, request, limit, cancellationToken);
        logger.LogInformation(
            "ValueSector POST generate completed. ListingId={ListingId}, RouteCount={Count}",
            listingId,
            response?.Routes.Count ?? 0);
        return Ok(ApiResponse<ValueSectorFromListingResponseDto>.Ok(response!));
    }

    private bool TryGetUserRole(out string role)
    {
        role = User.FindFirst("role")?.Value ?? string.Empty;
        return !string.IsNullOrWhiteSpace(role);
    }

    private bool TryGetUserRoleAndSubject(out string role, out string subject)
    {
        subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? string.Empty;
        role = User.FindFirst("role")?.Value ?? string.Empty;
        return !string.IsNullOrWhiteSpace(subject) && !string.IsNullOrWhiteSpace(role);
    }

    private static bool CanAccess(string role)
    {
        return string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<bool> CanReadListing(
        string role,
        string subject,
        ValueSectorListingSummaryDto listing,
        Guid listingId,
        CancellationToken cancellationToken)
    {
        if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase))
        {
            return string.Equals(listing.Status, "published", StringComparison.OrdinalIgnoreCase);
        }

        if (!string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (!Guid.TryParse(subject, out var sellerId))
        {
            return false;
        }

        return await valueSectorService.IsListingOwnedByAsync(listingId, sellerId, cancellationToken);
    }
}
