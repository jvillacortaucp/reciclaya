namespace ReciclaYa.Application.Regulation.Dtos;

public sealed record RegulationMeDto(
    string CurrentRegulationLevel,
    bool CanTransact,
    string? NextLevel,
    RegulationRequirementsSummaryDto RequirementsSummary);

public sealed record RegulationRequirementsSummaryDto(
    int Total,
    int Approved,
    int Pending);

public sealed record RegulationRequirementDto(
    string Id,
    int LevelId,
    string Title,
    string Description,
    bool Required,
    string ActorType,
    IReadOnlyCollection<string> AcceptedFileTypes,
    string CurrentStatus,
    string? UploadedFileName,
    string? UploadedFileUrl,
    string? UploadedFileKind,
    string? Notes);

public sealed record RegulationLevelDto(
    int Id,
    string Slug,
    string Title,
    string Subtitle,
    string RegularizationLabel,
    string RiskLevel,
    string Fiscalization,
    IReadOnlyCollection<string> Objective,
    IReadOnlyCollection<RegulationWasteCategoryDto> IncludedWasteCategories,
    IReadOnlyCollection<RegulationActorRequirementGroupDto> SellerRequirements,
    IReadOnlyCollection<RegulationActorRequirementGroupDto> BuyerRequirements,
    RegulationValidationRuleDto PlatformValidations,
    IReadOnlyCollection<string> Restrictions,
    RegulationTraceabilityDto Traceability,
    RegulationLegalRiskDto LegalRisks,
    IReadOnlyCollection<string> Regulations,
    IReadOnlyCollection<RegulationRequirementDto> RequirementsForUpload);

public sealed record RegulationWasteCategoryDto(string Id, string Title, IReadOnlyCollection<string> Examples);
public sealed record RegulationActorRequirementGroupDto(string Id, string Title, IReadOnlyCollection<string> RequiredItems, IReadOnlyCollection<string> RecommendedItems);
public sealed record RegulationValidationRuleDto(IReadOnlyCollection<string> Allowed, IReadOnlyCollection<string> Required);
public sealed record RegulationTraceabilityDto(string Label, IReadOnlyCollection<string> Items);
public sealed record RegulationLegalRiskDto(string Label, IReadOnlyCollection<string> Items);

public sealed record RegulationValidateOperationRequestDto(
    string Action,
    string? Actor,
    string? ResidueType,
    string? Sector,
    string? ProductType,
    string? SpecificResidue,
    decimal? Quantity,
    string? Unit);

public sealed record RegulationValidationResultDto(
    bool Allowed,
    string RequiredMinLevel,
    string ActorCurrentLevel,
    string? BlockingReasonCode,
    string BlockingMessage,
    string UpgradeCallToAction,
    IReadOnlyCollection<string> MissingRequirements,
    bool ManualReviewRequired);

public sealed record RegulationUploadRequirementEvidenceCommand(
    string RequirementId,
    string FileName,
    string ContentType,
    byte[] Content,
    long SizeBytes);

public sealed record RegulationRequirementReviewItemDto(
    Guid RequirementRecordId,
    Guid UserId,
    string RequesterName,
    string CompanyName,
    string? Ruc,
    int LevelId,
    string RequirementCode,
    string RequirementTitle,
    string ActorType,
    string CurrentStatus,
    string? UploadedFileName,
    string? UploadedFileKind,
    string? EvidenceUrl,
    string? Notes,
    DateTime? ReviewDeadlineAt,
    bool IsOverdue,
    DateTime? ApprovalExpiresAt,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record RegulationRequirementReviewPageDto(
    IReadOnlyCollection<RegulationRequirementReviewItemDto> Items,
    int Page,
    int PageSize,
    int Total,
    bool HasMore);

public sealed record RegulationMyRequirementsDto(
    IReadOnlyCollection<RegulationRequirementDto> Items,
    int Total,
    int Approved,
    int Pending,
    int Expired);

public sealed record RegulationRequirementReviewRequestDto(
    string Status,
    string? Notes,
    DateTime? ExpiresAt);

public sealed record RegulationCatalogHealthDto(
    bool IsHealthy,
    int TotalLevels,
    int TotalRequirements,
    IReadOnlyCollection<string> Issues);
