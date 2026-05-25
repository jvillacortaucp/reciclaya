using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Media.Models;

namespace ReciclaYa.Application.Regulation.Services;

public interface IRegulationService
{
    Task<RegulationMeDto> GetMeAsync(Guid userId, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<RegulationLevelDto>> GetLevelsAsync(Guid userId, CancellationToken cancellationToken);

    Task<RegulationValidationResultDto> ValidateOperationAsync(
        Guid userId,
        string userRole,
        RegulationValidateOperationRequestDto request,
        CancellationToken cancellationToken);

    Task<RegulationRequirementDto> UploadRequirementEvidenceAsync(
        Guid userId,
        RegulationUploadRequirementEvidenceCommand command,
        CancellationToken cancellationToken);

    Task<RegulationMyRequirementsDto> GetMyRequirementsAsync(Guid userId, CancellationToken cancellationToken);

    Task<RegulationRequirementDto> DeleteRequirementEvidenceAsync(
        Guid userId,
        string requirementId,
        CancellationToken cancellationToken);

    Task<RegulationRequirementReviewPageDto> GetPendingRequirementReviewsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<RegulationRequirementDto> ReviewRequirementAsync(
        Guid adminUserId,
        Guid requirementRecordId,
        RegulationRequirementReviewRequestDto request,
        CancellationToken cancellationToken);

    Task<DownloadedFileResult> DownloadRequirementEvidenceAsync(
        Guid requirementRecordId,
        CancellationToken cancellationToken);

    Task<RegulationRequirementReviewPageDto> GetRequirementReviewHistoryAsync(
        int page,
        int pageSize,
        string? status,
        CancellationToken cancellationToken);

    Task<RegulationCatalogHealthDto> GetCatalogHealthAsync(CancellationToken cancellationToken);

    Task<RegulationAdminCatalogDto> GetAdminCatalogAsync(CancellationToken cancellationToken);

    Task<RegulationAdminLevelDto> UpdateAdminLevelAsync(
        int levelId,
        RegulationAdminLevelUpdateDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task<RegulationAdminRequirementDto> AddAdminRequirementAsync(
        int levelId,
        RegulationAdminRequirementUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task<RegulationAdminRequirementDto> UpdateAdminRequirementAsync(
        Guid requirementId,
        RegulationAdminRequirementUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task DeleteAdminRequirementAsync(Guid requirementId, Guid adminUserId, CancellationToken cancellationToken);

    Task<RegulationAdminAllowedResidueDto> AddAdminAllowedResidueAsync(
        int levelId,
        RegulationAdminAllowedResidueUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task<RegulationAdminAllowedResidueDto> UpdateAdminAllowedResidueAsync(
        Guid residueId,
        RegulationAdminAllowedResidueUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task DeleteAdminAllowedResidueAsync(Guid residueId, Guid adminUserId, CancellationToken cancellationToken);

    Task<RegulationAdminNormativeDto> AddAdminNormativeAsync(
        int levelId,
        RegulationAdminNormativeUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task<RegulationAdminNormativeDto> UpdateAdminNormativeAsync(
        Guid normativeId,
        RegulationAdminNormativeUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken);

    Task DeleteAdminNormativeAsync(Guid normativeId, Guid adminUserId, CancellationToken cancellationToken);

    Task<RegulationEvidenceVerificationResultDto> VerifyListingEvidenceAsync(
        Guid userId,
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken);

    Task<RegulationUserLevelRecalculationDto> RecalculateUserLevelAsync(
        Guid userId,
        string auditActor,
        CancellationToken cancellationToken);
}
