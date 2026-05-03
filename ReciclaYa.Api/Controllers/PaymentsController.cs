using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Payments.Dtos;
using ReciclaYa.Application.Payments.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public sealed class PaymentsController(IPaymentService paymentService) : ControllerBase
{
    [HttpPost("simulate")]
    public async Task<IActionResult> Simulate(
        [FromBody] SimulatePaymentRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!CanPay(role))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var payment = await paymentService.SimulateAsync(
                userId,
                IsAdmin(role),
                request,
                cancellationToken);

            return Ok(ApiResponse<PaymentTransactionDto>.Ok(payment, "Payment processed."));
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("own order", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail(ex.Message, ["FORBIDDEN"]));
            }

            return BadRequest(ApiResponse<object>.Fail(ex.Message, ["INVALID_PAYMENT"]));
        }
    }

    private static bool CanPay(string role)
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
