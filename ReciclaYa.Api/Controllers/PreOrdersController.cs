using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.PreOrders.Dtos;
using ReciclaYa.Application.PreOrders.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/pre-orders")]
public sealed class PreOrdersController(IPreOrderService preOrderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPreOrders(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanUsePreOrders(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var preOrders = await preOrderService.GetPreOrdersAsync(
            userId,
            IsAdmin(role),
            cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<PreOrderDto>>.Ok(preOrders));
    }

    [HttpGet("new-screen/{listingId:guid}")]
    public async Task<IActionResult> GetNewScreen(
        Guid listingId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanUsePreOrders(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        PreOrderNewScreenDto? screen;
        try
        {
            screen = await preOrderService.GetNewScreenAsync(
                userId,
                IsAdmin(role),
                listingId,
                cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }

        if (screen is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<PreOrderNewScreenDto>.Ok(screen));
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> Simulate(
        [FromBody] PreOrderRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanUsePreOrders(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var summary = await preOrderService.SimulateAsync(
                userId,
                IsAdmin(role),
                request,
                cancellationToken);

            return Ok(ApiResponse<PreOrderPricingDto>.Ok(summary));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] PreOrderRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanUsePreOrders(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var created = await preOrderService.CreateAsync(
                userId,
                IsAdmin(role),
                request,
                cancellationToken);

            return Ok(ApiResponse<PreOrderDto>.Ok(created, "Pre-order created."));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    private IActionResult MapInvalidOperation(InvalidOperationException exception)
    {
        if (exception.Message.Contains("own listing", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail(exception.Message, ["FORBIDDEN"]));
        }

        return BadRequest(ApiResponse<object>.Fail(exception.Message, ["INVALID_PRE_ORDER"]));
    }

    private static bool CanUsePreOrders(string role)
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
