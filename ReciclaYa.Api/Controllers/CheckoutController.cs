using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Checkout.Dtos;
using ReciclaYa.Application.Checkout.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/checkout")]
public sealed class CheckoutController(ICheckoutService checkoutService) : ControllerBase
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
}
