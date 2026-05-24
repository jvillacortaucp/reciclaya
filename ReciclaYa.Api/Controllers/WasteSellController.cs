using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Services;
using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Regulation.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/waste-sell")]
public sealed class WasteSellController(
    IListingService listingService,
    IRegulationService regulationService) : ControllerBase
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
        [FromQuery] Guid? listingId,
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

        var validation = await regulationService.ValidateOperationAsync(
            userId,
            User.FindFirst("role")?.Value ?? string.Empty,
            new RegulationValidateOperationRequestDto(
                Action: "publish",
                Actor: "seller",
                ResidueType: request.FormValue.ResidueType,
                Sector: request.FormValue.Sector,
                ProductType: request.FormValue.ProductType,
                SpecificResidue: request.FormValue.SpecificResidue,
                Quantity: request.FormValue.Volume.Quantity,
                Unit: request.FormValue.Volume.Unit),
            cancellationToken);

        if (!validation.Allowed)
        {
            return RegulatoryBlocked(validation);
        }

        var evidenceCheck = await regulationService.VerifyListingEvidenceAsync(
            userId,
            new RegulationEvidenceVerificationRequestDto(
                SpecificResidue: request.FormValue.SpecificResidue,
                ResidueType: request.FormValue.ResidueType,
                Sector: request.FormValue.Sector,
                ProductType: request.FormValue.ProductType,
                Quantity: request.FormValue.Volume.Quantity,
                Unit: request.FormValue.Volume.Unit,
                MediaUrls: request.FormValue.MediaUploads
                    .Select(item => item.PreviewUrl)
                    .Where(item => !string.IsNullOrWhiteSpace(item))
                    .ToArray()),
            cancellationToken);

        await listingService.PublishAsync(userId, request, listingId, cancellationToken);

        return Ok(ApiResponse<object>.Ok(new
        {
            published = true,
            complianceWarnings = evidenceCheck.ManualReviewRequired || evidenceCheck.RiskLevel == "high"
                ? new[] { evidenceCheck }
                : Array.Empty<RegulationEvidenceVerificationResultDto>()
        }, "Listing published."));
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
