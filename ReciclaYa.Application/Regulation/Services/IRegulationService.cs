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
}
