using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.PurchasePreferences.Dtos;
using ReciclaYa.Application.PurchasePreferences.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/purchase-preferences")]
public sealed class PurchasePreferencesController(
    IPurchasePreferenceService purchasePreferenceService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        var access = await EnsureAccessAsync(cancellationToken);
        if (access is not null)
        {
            return access;
        }

        var response = await purchasePreferenceService.GetCurrentAsync(
            GetUserId(),
            cancellationToken);

        return Ok(ApiResponse<PurchasePreferenceResponseDto>.Ok(response));
    }

    [HttpPut("current")]
    public async Task<IActionResult> SaveCurrent(
        [FromBody] PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken)
    {
        var access = await EnsureAccessAsync(cancellationToken);
        if (access is not null)
        {
            return access;
        }

        var response = await purchasePreferenceService.SaveCurrentAsync(
            GetUserId(),
            request,
            cancellationToken);

        return Ok(ApiResponse<PurchasePreferenceResponseDto>.Ok(response, "Purchase preference saved."));
    }

    [HttpPost("current/activate-alert")]
    public async Task<IActionResult> ActivateAlert(
        [FromBody] PurchasePreferenceRequestDto? request,
        CancellationToken cancellationToken)
    {
        var access = await EnsureAccessAsync(cancellationToken);
        if (access is not null)
        {
            return access;
        }

        var response = await purchasePreferenceService.ActivateAlertAsync(
            GetUserId(),
            request,
            cancellationToken);

        return Ok(ApiResponse<PurchasePreferenceResponseDto>.Ok(response, "Purchase preference alert activated."));
    }

    [HttpPost("summary")]
    public async Task<IActionResult> BuildSummary(
        [FromBody] PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken)
    {
        var access = await EnsureAccessAsync(cancellationToken);
        if (access is not null)
        {
            return access;
        }

        var response = await purchasePreferenceService.BuildSummaryAsync(
            request,
            cancellationToken);

        return Ok(ApiResponse<PurchasePreferenceSummaryDto>.Ok(response));
    }

    private async Task<IActionResult?> EnsureAccessAsync(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var canManagePreferences = await purchasePreferenceService.CanManagePreferencesAsync(
            userId,
            cancellationToken);

        return canManagePreferences
            ? null
            : StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
    }

    private Guid GetUserId()
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.Parse(subject!);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(subject, out userId);
    }
}
