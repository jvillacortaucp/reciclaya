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
public sealed class PreOrdersController(
    IPreOrderService preOrderService,
    IQuotationPdfService quotationPdfService,
    ILogger<PreOrdersController> logger) : ControllerBase
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

    [HttpGet("{preOrderId:guid}/quotation/pdf")]
    public async Task<IActionResult> DownloadQuotationPdf(
        Guid preOrderId,
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
            var pdfBytes = await quotationPdfService.GeneratePreOrderQuotationPdfAsync(
                preOrderId,
                userId,
                IsAdmin(role),
                cancellationToken);

            var fileName = $"cotizacion-preorden-{preOrderId}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.Fail("Pre-order not found.", ["PRE_ORDER_NOT_FOUND"]));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Could not generate pre-order quotation PDF. PreOrderId={PreOrderId} UserId={UserId}",
                preOrderId,
                userId);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Fail("Could not generate quotation PDF.", ["PDF_GENERATION_ERROR"]));
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
            || string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
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
