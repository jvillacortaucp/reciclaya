using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Checkout.Dtos;
using ReciclaYa.Application.Checkout.Services;
using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Regulation.Services;
using Microsoft.EntityFrameworkCore;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/checkout")]
public sealed class CheckoutController(
    ICheckoutService checkoutService,
    IRegulationService regulationService,
    IAuthDbContext dbContext) : ControllerBase
{
    [HttpPost("from-listing/{listingId:guid}")]
    public async Task<IActionResult> FromListing(
        Guid listingId,
        [FromBody] CreateCheckoutFromListingRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanCheckout(role))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var listingContext = await dbContext.Listings
            .AsNoTracking()
            .Where(item => item.Id == listingId)
            .Select(item => new { item.WasteType, item.Sector, item.ProductType, item.SpecificResidue, item.Quantity, item.Unit })
            .FirstOrDefaultAsync(cancellationToken);

        var validation = await regulationService.ValidateOperationAsync(
            userId,
            role,
            new RegulationValidateOperationRequestDto(
                Action: "confirm_purchase",
                Actor: "buyer",
                ResidueType: listingContext?.WasteType,
                Sector: listingContext?.Sector,
                ProductType: listingContext?.ProductType,
                SpecificResidue: listingContext?.SpecificResidue,
                Quantity: listingContext?.Quantity,
                Unit: listingContext?.Unit),
            cancellationToken);

        if (!validation.Allowed)
        {
            return RegulatoryBlocked(validation);
        }

        try
        {
            var order = await checkoutService.CreateFromListingAsync(
                userId,
                IsAdmin(role),
                listingId,
                request,
                cancellationToken);

            return Ok(ApiResponse<CheckoutOrderDto>.Ok(order, "Order created."));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPost("from-preorder/{preOrderId:guid}")]
    public async Task<IActionResult> FromPreOrder(Guid preOrderId, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanCheckout(role))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var listingContext = await dbContext.PreOrders
            .AsNoTracking()
            .Where(item => item.Id == preOrderId)
            .Join(
                dbContext.Listings.AsNoTracking(),
                preOrder => preOrder.ListingId,
                listing => listing.Id,
                (preOrder, listing) => new { listing.WasteType, listing.Sector, listing.ProductType, listing.SpecificResidue, listing.Quantity, listing.Unit })
            .FirstOrDefaultAsync(cancellationToken);

        var validation = await regulationService.ValidateOperationAsync(
            userId,
            role,
            new RegulationValidateOperationRequestDto(
                Action: "confirm_purchase",
                Actor: "buyer",
                ResidueType: listingContext?.WasteType,
                Sector: listingContext?.Sector,
                ProductType: listingContext?.ProductType,
                SpecificResidue: listingContext?.SpecificResidue,
                Quantity: listingContext?.Quantity,
                Unit: listingContext?.Unit),
            cancellationToken);

        if (!validation.Allowed)
        {
            return RegulatoryBlocked(validation);
        }

        try
        {
            var order = await checkoutService.CreateFromPreOrderAsync(
                userId,
                IsAdmin(role),
                preOrderId,
                cancellationToken);

            return Ok(ApiResponse<CheckoutOrderDto>.Ok(order, "Order created."));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    private IActionResult MapInvalidOperation(InvalidOperationException exception)
    {
        if (exception.Message.Contains("own", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(exception.Message, ["FORBIDDEN"]));
        }

        return BadRequest(ApiResponse<object>.Fail(exception.Message, ["INVALID_CHECKOUT"]));
    }

    private static bool CanCheckout(string role)
    {
        return string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAdmin(string role)
    {
        return string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId);
    }

    private IActionResult RegulatoryBlocked(RegulationValidationResultDto validation)
    {
        return StatusCode(StatusCodes.Status403Forbidden, new
        {
            success = false,
            data = validation,
            message = validation.BlockingMessage,
            errors = new[] { validation.BlockingReasonCode ?? "REGULATION_BLOCKED" }
        });
    }
}
