using System.IdentityModel.Tokens.Jwt;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Regulation.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/regulation")]
public sealed class RegulationController(IRegulationService regulationService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var response = await regulationService.GetMeAsync(userId, cancellationToken);
        return Ok(ApiResponse<RegulationMeDto>.Ok(response));
    }

    [HttpGet("levels")]
    public async Task<IActionResult> GetLevels(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var response = await regulationService.GetLevelsAsync(userId, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<RegulationLevelDto>>.Ok(response));
    }

    [HttpGet("me/requirements")]
    public async Task<IActionResult> GetMyRequirements(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var response = await regulationService.GetMyRequirementsAsync(userId, cancellationToken);
        return Ok(ApiResponse<RegulationMyRequirementsDto>.Ok(response));
    }

    [HttpPost("validate-operation")]
    public async Task<IActionResult> ValidateOperation(
        [FromBody] RegulationValidateOperationRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var response = await regulationService.ValidateOperationAsync(userId, role, request, cancellationToken);
        return Ok(ApiResponse<RegulationValidationResultDto>.Ok(response));
    }

    [HttpPost("verify-listing-evidence")]
    public async Task<IActionResult> VerifyListingEvidence(
        [FromBody] RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var response = await regulationService.VerifyListingEvidenceAsync(userId, request, cancellationToken);
        return Ok(ApiResponse<RegulationEvidenceVerificationResultDto>.Ok(response));
    }

    [HttpPost("requirements/{requirementId}/evidence")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadRequirementEvidence(
        [FromRoute] string requirementId,
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (file is null || file.Length <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("File is required.", ["EVIDENCE_FILE_REQUIRED"]));
        }

        await using var stream = file.OpenReadStream();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);

        try
        {
            var response = await regulationService.UploadRequirementEvidenceAsync(
                userId,
                new RegulationUploadRequirementEvidenceCommand(
                    requirementId,
                    file.FileName,
                    file.ContentType,
                    memory.ToArray(),
                    file.Length),
                cancellationToken);

            return Ok(ApiResponse<RegulationRequirementDto>.Ok(response, "Evidence uploaded successfully."));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "EVIDENCE_UPLOAD_FAILED" : ex.Message;
            var status = code switch
            {
                "EVIDENCE_FILE_REQUIRED" => 400,
                "EVIDENCE_FILE_TOO_LARGE" => 400,
                "EVIDENCE_FILE_EXTENSION_NOT_ALLOWED" => 400,
                "EVIDENCE_FILE_CONTENT_TYPE_NOT_ALLOWED" => 400,
                "EVIDENCE_REQUIREMENT_ID_REQUIRED" => 400,
                "EVIDENCE_REQUIREMENT_NOT_FOUND" => 404,
                "STORAGE_BUCKET_NOT_CONFIGURED" => 500,
                "EVIDENCE_UPLOAD_FAILED" => 502,
                _ => 400
            };

            return StatusCode(status, ApiResponse<object>.Fail("No se pudo cargar la evidencia.", [code]));
        }
    }

    [HttpDelete("requirements/{requirementId}/evidence")]
    public async Task<IActionResult> DeleteRequirementEvidence(
        [FromRoute] string requirementId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out _))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        try
        {
            var response = await regulationService.DeleteRequirementEvidenceAsync(userId, requirementId, cancellationToken);
            return Ok(ApiResponse<RegulationRequirementDto>.Ok(response, "Evidence removed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "EVIDENCE_DELETE_FAILED" : ex.Message;
            var status = code switch
            {
                "EVIDENCE_REQUIREMENT_ID_REQUIRED" => 400,
                "EVIDENCE_NOT_FOUND" => 404,
                "EVIDENCE_DELETE_NOT_ALLOWED_FOR_REVIEWED" => 409,
                _ => 400
            };

            return StatusCode(status, ApiResponse<object>.Fail("No se pudo eliminar la evidencia.", [code]));
        }
    }

    [HttpGet("review/pending")]
    public async Task<IActionResult> GetPendingReviews(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.GetPendingRequirementReviewsAsync(page, pageSize, cancellationToken);
        return Ok(ApiResponse<RegulationRequirementReviewPageDto>.Ok(response));
    }

    [HttpGet("review/history")]
    public async Task<IActionResult> GetReviewHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.GetRequirementReviewHistoryAsync(page, pageSize, status, cancellationToken);
        return Ok(ApiResponse<RegulationRequirementReviewPageDto>.Ok(response));
    }

    [HttpPatch("review/{requirementRecordId:guid}")]
    public async Task<IActionResult> ReviewRequirement(
        [FromRoute] Guid requirementRecordId,
        [FromBody] RegulationRequirementReviewRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var response = await regulationService.ReviewRequirementAsync(adminUserId, requirementRecordId, request, cancellationToken);
            return Ok(ApiResponse<RegulationRequirementDto>.Ok(response, "Requirement reviewed successfully."));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "REVIEW_FAILED" : ex.Message;
            var status = code switch
            {
                "INVALID_REVIEW_STATUS" => 400,
                "INVALID_REVIEW_TRANSITION" => 409,
                "REJECT_REQUIRES_NOTES" => 400,
                "REQUIREMENT_RECORD_NOT_FOUND" => 404,
                _ => 400
            };

            return StatusCode(status, ApiResponse<object>.Fail("No se pudo revisar el requisito.", [code]));
        }
    }

    [HttpGet("review/{requirementRecordId:guid}/download")]
    public async Task<IActionResult> DownloadRequirementEvidence(
        [FromRoute] Guid requirementRecordId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var file = await regulationService.DownloadRequirementEvidenceAsync(requirementRecordId, cancellationToken);
            return File(file.Content, file.ContentType, file.FileName);
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "EVIDENCE_DOWNLOAD_FAILED" : ex.Message;
            var status = code switch
            {
                "REQUIREMENT_RECORD_NOT_FOUND" => 404,
                "EVIDENCE_NOT_FOUND" => 404,
                "EVIDENCE_URL_INVALID" => 400,
                _ => 400
            };

            return StatusCode(status, ApiResponse<object>.Fail("No se pudo descargar la evidencia.", [code]));
        }
    }

    [HttpGet("catalog/health")]
    public async Task<IActionResult> GetCatalogHealth(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.GetCatalogHealthAsync(cancellationToken);
        return Ok(ApiResponse<RegulationCatalogHealthDto>.Ok(response));
    }

    [HttpGet("admin/catalog")]
    public async Task<IActionResult> GetAdminCatalog(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.GetAdminCatalogAsync(cancellationToken);
        return Ok(ApiResponse<RegulationAdminCatalogDto>.Ok(response));
    }

    [HttpPut("admin/levels/{levelId:int}")]
    public async Task<IActionResult> UpdateAdminLevel(
        [FromRoute] int levelId,
        [FromBody] RegulationAdminLevelUpdateDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var response = await regulationService.UpdateAdminLevelAsync(levelId, request, adminUserId, cancellationToken);
            return Ok(ApiResponse<RegulationAdminLevelDto>.Ok(response));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "REGULATION_ADMIN_UPDATE_FAILED" : ex.Message;
            return BadRequest(ApiResponse<object>.Fail("No se pudo actualizar el nivel regulatorio.", [code]));
        }
    }

    [HttpPost("admin/levels/{levelId:int}/requirements")]
    public async Task<IActionResult> AddAdminRequirement(
        [FromRoute] int levelId,
        [FromBody] RegulationAdminRequirementUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var response = await regulationService.AddAdminRequirementAsync(levelId, request, adminUserId, cancellationToken);
            return Ok(ApiResponse<RegulationAdminRequirementDto>.Ok(response));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "REGULATION_ADMIN_REQUIREMENT_ADD_FAILED" : ex.Message;
            return BadRequest(ApiResponse<object>.Fail("No se pudo crear el requisito regulatorio.", [code]));
        }
    }

    [HttpPatch("admin/requirements/{requirementId:guid}")]
    public async Task<IActionResult> UpdateAdminRequirement(
        [FromRoute] Guid requirementId,
        [FromBody] RegulationAdminRequirementUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var response = await regulationService.UpdateAdminRequirementAsync(requirementId, request, adminUserId, cancellationToken);
            return Ok(ApiResponse<RegulationAdminRequirementDto>.Ok(response));
        }
        catch (InvalidOperationException ex)
        {
            var code = string.IsNullOrWhiteSpace(ex.Message) ? "REGULATION_ADMIN_REQUIREMENT_PATCH_FAILED" : ex.Message;
            return BadRequest(ApiResponse<object>.Fail("No se pudo actualizar el requisito regulatorio.", [code]));
        }
    }

    [HttpDelete("admin/requirements/{requirementId:guid}")]
    public async Task<IActionResult> DeleteAdminRequirement(
        [FromRoute] Guid requirementId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        await regulationService.DeleteAdminRequirementAsync(requirementId, adminUserId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Requirement deleted."));
    }

    [HttpPost("admin/levels/{levelId:int}/allowed-residues")]
    public async Task<IActionResult> AddAdminAllowedResidue(
        [FromRoute] int levelId,
        [FromBody] RegulationAdminAllowedResidueUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.AddAdminAllowedResidueAsync(levelId, request, adminUserId, cancellationToken);
        return Ok(ApiResponse<RegulationAdminAllowedResidueDto>.Ok(response));
    }

    [HttpPatch("admin/allowed-residues/{residueId:guid}")]
    public async Task<IActionResult> UpdateAdminAllowedResidue(
        [FromRoute] Guid residueId,
        [FromBody] RegulationAdminAllowedResidueUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.UpdateAdminAllowedResidueAsync(residueId, request, adminUserId, cancellationToken);
        return Ok(ApiResponse<RegulationAdminAllowedResidueDto>.Ok(response));
    }

    [HttpDelete("admin/allowed-residues/{residueId:guid}")]
    public async Task<IActionResult> DeleteAdminAllowedResidue(
        [FromRoute] Guid residueId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        await regulationService.DeleteAdminAllowedResidueAsync(residueId, adminUserId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Allowed residue deleted."));
    }

    [HttpPost("admin/levels/{levelId:int}/normatives")]
    public async Task<IActionResult> AddAdminNormative(
        [FromRoute] int levelId,
        [FromBody] RegulationAdminNormativeUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.AddAdminNormativeAsync(levelId, request, adminUserId, cancellationToken);
        return Ok(ApiResponse<RegulationAdminNormativeDto>.Ok(response));
    }

    [HttpPatch("admin/normatives/{normativeId:guid}")]
    public async Task<IActionResult> UpdateAdminNormative(
        [FromRoute] Guid normativeId,
        [FromBody] RegulationAdminNormativeUpsertDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var response = await regulationService.UpdateAdminNormativeAsync(normativeId, request, adminUserId, cancellationToken);
        return Ok(ApiResponse<RegulationAdminNormativeDto>.Ok(response));
    }

    [HttpDelete("admin/normatives/{normativeId:guid}")]
    public async Task<IActionResult> DeleteAdminNormative(
        [FromRoute] Guid normativeId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var adminUserId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        if (!string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        await regulationService.DeleteAdminNormativeAsync(normativeId, adminUserId, cancellationToken);
        return Ok(ApiResponse<object>.Ok(new { }, "Normative deleted."));
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;
        return Guid.TryParse(subject, out userId);
    }
}
