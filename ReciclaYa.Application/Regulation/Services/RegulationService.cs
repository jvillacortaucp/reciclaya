using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Options;
using ReciclaYa.Application.Media.Services;
using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Regulation.Options;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;
using System.IO;
using System.Text.Json;

namespace ReciclaYa.Application.Regulation.Services;

public sealed class RegulationService(
    IAuthDbContext dbContext,
    IStorageService storageService,
    IRegulationEvidenceAiVerifier evidenceAiVerifier,
    IOptions<AiEvidenceCheckOptions> aiEvidenceOptions,
    IOptions<SupabaseOptions> supabaseOptions,
    IOptions<RegulationReviewOptions> regulationReviewOptions,
    ILogger<RegulationService> logger) : IRegulationService
{
    private const long MaxEvidenceFileSizeBytes = 10 * 1024 * 1024;
    private const string RequirementStatusPending = "pending";
    private const string RequirementStatusUploaded = "uploaded";
    private const string RequirementStatusInReview = "in_review";
    private const string RequirementStatusApproved = "approved";
    private const string RequirementStatusRejected = "rejected";

    private static readonly HashSet<string> AllowedEvidenceExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"
    };

    private static readonly HashSet<string> AllowedEvidenceContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    private readonly SupabaseOptions _supabaseOptions = supabaseOptions.Value;
    private readonly RegulationReviewOptions _regulationReviewOptions = regulationReviewOptions.Value;
    private readonly AiEvidenceCheckOptions _aiEvidenceOptions = aiEvidenceOptions.Value;

    public async Task<RegulationMeDto> GetMeAsync(Guid userId, CancellationToken cancellationToken)
    {
        await TryAutoPromoteUserLevelAsync(userId, "system", cancellationToken);
        var profile = await EnsureProfileAsync(userId, cancellationToken);
        var requirements = await dbContext.UserRegulationRequirements
            .Where(item => item.UserId == userId)
            .ToListAsync(cancellationToken);

        var approved = requirements.Count(item => string.Equals(item.Status, "approved", StringComparison.OrdinalIgnoreCase));
        var pending = requirements.Count(item => !string.Equals(item.Status, "approved", StringComparison.OrdinalIgnoreCase));
        var total = requirements.Count;

        return new RegulationMeDto(
            CurrentRegulationLevel: ToLevelSlug((int)profile.CurrentLevel),
            CanTransact: profile.CurrentLevel != RegulationLevel.Level0,
            NextLevel: (int)profile.CurrentLevel >= 4 ? null : ToLevelSlug((int)profile.CurrentLevel + 1),
            RequirementsSummary: new RegulationRequirementsSummaryDto(total, approved, pending));
    }

    public async Task<IReadOnlyCollection<RegulationLevelDto>> GetLevelsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var requirementStates = userId == Guid.Empty
            ? []
            : await dbContext.UserRegulationRequirements
                .Where(item => item.UserId == userId)
                .ToListAsync(cancellationToken);

        var catalogRows = await dbContext.RegulationLevelCatalogs
            .AsNoTracking()
            .OrderBy(item => item.Level)
            .ToListAsync(cancellationToken);

        if (catalogRows.Count > 0)
        {
            var levels = catalogRows
                .Select(item => Deserialize<RegulationLevelDto>(item.PayloadJson))
                .Where(item => item is not null)
                .Select(item => item!)
                .ToArray();

            var hydrated = new List<RegulationLevelDto>(levels.Length);
            foreach (var level in levels)
            {
                hydrated.Add(await ApplyRequirementStatusesAsync(level, requirementStates, cancellationToken));
            }

            return hydrated;
        }

        return [];
    }

    public async Task<RegulationValidationResultDto> ValidateOperationAsync(
        Guid userId,
        string userRole,
        RegulationValidateOperationRequestDto request,
        CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileAsync(userId, cancellationToken);
        var actor = ResolveActor(userRole, request.Actor);
        var requiredMinLevel = await ClassifyRequiredLevelAsync(request, cancellationToken);
        var currentLevel = (int)profile.CurrentLevel;
        var action = request.Action?.Trim().ToLowerInvariant() ?? string.Empty;

        var isTransactAction = action is "publish" or "buy" or "negotiate" or "confirm_purchase";
        if (!isTransactAction)
        {
            return new RegulationValidationResultDto(
                true,
                ToLevelSlug(requiredMinLevel),
                ToLevelSlug(currentLevel),
                null,
                "Operacion permitida.",
                "Continua explorando y completa tus requisitos para operar mas niveles.",
                [],
                false);
        }

        if (currentLevel == 0)
        {
            var result = new RegulationValidationResultDto(
                false,
                ToLevelSlug(Math.Max(1, requiredMinLevel)),
                ToLevelSlug(currentLevel),
                "LEVEL0_TRANSACTION_BLOCKED",
                "Tu cuenta esta en nivel 0. Puedes explorar, pero no realizar operaciones transaccionales.",
                "Completa los requisitos del Nivel 1 para publicar, negociar o comprar.",
                ["Completar regularizacion base de Nivel 1."],
                false);
            await SaveAuditAsync(userId, actor, request, result, cancellationToken);
            return result;
        }

        var user = await dbContext.Users
            .Include(item => item.Company)
            .Include(item => item.PersonProfile)
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            var result = new RegulationValidationResultDto(
                false,
                ToLevelSlug(Math.Max(1, requiredMinLevel)),
                ToLevelSlug(currentLevel),
                "REGULATORY_USER_NOT_FOUND",
                "No se pudo validar la informacion del usuario para esta operacion.",
                "Actualiza tu perfil y vuelve a intentarlo.",
                ["Completar perfil de usuario."],
                false);
            await SaveAuditAsync(userId, actor, request, result, cancellationToken);
            return result;
        }

        var missingBaseRequirements = GetMissingBaseRequirements(user, actor);
        if (missingBaseRequirements.Count > 0)
        {
            var result = new RegulationValidationResultDto(
                false,
                ToLevelSlug(Math.Max(1, requiredMinLevel)),
                ToLevelSlug(currentLevel),
                "MISSING_USER_PROFILE_REQUIREMENTS",
                "Falta informacion base del perfil para habilitar operaciones reguladas.",
                "Completa tu perfil y los requisitos obligatorios para continuar.",
                missingBaseRequirements,
                false);
            await SaveAuditAsync(userId, actor, request, result, cancellationToken);
            return result;
        }

        if (currentLevel < requiredMinLevel)
        {
            var result = new RegulationValidationResultDto(
                false,
                ToLevelSlug(requiredMinLevel),
                ToLevelSlug(currentLevel),
                "INSUFFICIENT_REGULATION_LEVEL",
                $"La operacion requiere {ToLevelSlug(requiredMinLevel)} y tu cuenta esta en {ToLevelSlug(currentLevel)}.",
                $"Sube al {ToLevelSlug(requiredMinLevel)} y completa requisitos pendientes para continuar.",
                await GetMissingRequirementsAsync(userId, requiredMinLevel, actor, cancellationToken),
                requiredMinLevel >= 4);
            await SaveAuditAsync(userId, actor, request, result, cancellationToken);
            return result;
        }

        var missingRequiredByLevel = await GetMissingRequiredLevelRequirementsAsync(
            userId,
            actor,
            requiredMinLevel,
            cancellationToken);
        if (missingRequiredByLevel.Count > 0)
        {
            var result = new RegulationValidationResultDto(
                false,
                ToLevelSlug(requiredMinLevel),
                ToLevelSlug(currentLevel),
                "MISSING_LEVEL_REQUIREMENTS",
                "Tu nivel actual no tiene todos los requisitos obligatorios aprobados para esta operacion.",
                $"Completa los requisitos obligatorios del {ToLevelSlug(requiredMinLevel)}.",
                missingRequiredByLevel,
                requiredMinLevel >= 4);
            await SaveAuditAsync(userId, actor, request, result, cancellationToken);
            return result;
        }

        var okResult = new RegulationValidationResultDto(
            true,
            ToLevelSlug(requiredMinLevel),
            ToLevelSlug(currentLevel),
            null,
            "Operacion permitida por cumplimiento regulatorio.",
            "Puedes continuar.",
            [],
            requiredMinLevel >= 4);

        await SaveAuditAsync(userId, actor, request, okResult, cancellationToken);
        return okResult;
    }

    public async Task<RegulationRequirementDto> UploadRequirementEvidenceAsync(
        Guid userId,
        RegulationUploadRequirementEvidenceCommand command,
        CancellationToken cancellationToken)
    {
        var requirementId = command.RequirementId?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(requirementId))
        {
            throw new InvalidOperationException("EVIDENCE_REQUIREMENT_ID_REQUIRED");
        }

        ValidateEvidenceFile(command);
        await EnsureProfileAsync(userId, cancellationToken);

        var definition = await FindRequirementDefinitionAsync(requirementId, cancellationToken);
        if (definition is null)
        {
            throw new InvalidOperationException("EVIDENCE_REQUIREMENT_NOT_FOUND");
        }

        var extension = Path.GetExtension(command.FileName).ToLowerInvariant();
        var fileKind = ResolveFileKind(command.ContentType, extension);
        var bucket = _supabaseOptions.PrivateBucket;
        if (string.IsNullOrWhiteSpace(bucket))
        {
            throw new InvalidOperationException("STORAGE_BUCKET_NOT_CONFIGURED");
        }

        var safeFileName = BuildSafeFileName(command.FileName, extension);
        var storagePath = $"regulation/{userId:D}/level-{definition.Value.LevelId}/{requirementId}/{Guid.NewGuid():D}-{safeFileName}";

        UploadedFileResult uploadResult;
        try
        {
            uploadResult = await storageService.UploadAsync(
                new MediaUploadCommand(bucket, storagePath, command.ContentType, command.Content, MediaVisibility.Private),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Regulation evidence upload failed. UserId={UserId}, RequirementId={RequirementId}", userId, requirementId);
            throw new InvalidOperationException("EVIDENCE_UPLOAD_FAILED");
        }

        var evidenceUrl = uploadResult.PublicUrl ?? BuildPrivateObjectUrl(bucket, storagePath);
        var current = await dbContext.UserRegulationRequirements
            .FirstOrDefaultAsync(item =>
                item.UserId == userId
                && item.Level == definition.Value.LevelId
                && item.RequirementCode == requirementId,
                cancellationToken);

        if (current is null)
        {
            current = new UserRegulationRequirement
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Level = definition.Value.LevelId,
                RequirementCode = requirementId,
                Status = RequirementStatusUploaded,
                EvidenceUrl = evidenceUrl,
                Notes = $"Archivo cargado: {command.FileName}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.UserRegulationRequirements.Add(current);
        }
        else
        {
            current.Status = RequirementStatusUploaded;
            current.EvidenceUrl = evidenceUrl;
            current.Notes = $"Archivo cargado: {command.FileName}";
            current.UpdatedAt = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return definition.Value.Requirement with
        {
            CurrentStatus = current.Status,
            UploadedFileName = command.FileName,
            UploadedFileUrl = evidenceUrl,
            UploadedFileKind = fileKind,
            Notes = current.Notes
        };
    }

    public async Task<RegulationMyRequirementsDto> GetMyRequirementsAsync(Guid userId, CancellationToken cancellationToken)
    {
        await EnsureProfileAsync(userId, cancellationToken);
        var levels = await GetLevelsAsync(userId, cancellationToken);
        var items = levels
            .SelectMany(level => level.RequirementsForUpload)
            .OrderBy(item => item.LevelId)
            .ThenBy(item => item.Title)
            .ToArray();

        var now = DateTime.UtcNow;
        var persisted = await dbContext.UserRegulationRequirements
            .Where(item => item.UserId == userId)
            .ToListAsync(cancellationToken);
        var expired = persisted.Count(item =>
            item.ExpiresAt.HasValue
            && item.ExpiresAt.Value <= now
            && string.Equals(item.Status, "approved", StringComparison.OrdinalIgnoreCase));

        return new RegulationMyRequirementsDto(
            Items: items,
            Total: items.Length,
            Approved: items.Count(item => string.Equals(item.CurrentStatus, "approved", StringComparison.OrdinalIgnoreCase)),
            Pending: items.Count(item => !string.Equals(item.CurrentStatus, "approved", StringComparison.OrdinalIgnoreCase)),
            Expired: expired);
    }

    public async Task<RegulationRequirementDto> DeleteRequirementEvidenceAsync(
        Guid userId,
        string requirementId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(requirementId))
        {
            throw new InvalidOperationException("EVIDENCE_REQUIREMENT_ID_REQUIRED");
        }
        var normalizedRequirementId = requirementId.Trim().ToLowerInvariant();

        var record = await dbContext.UserRegulationRequirements
            .FirstOrDefaultAsync(item =>
                item.UserId == userId
                && item.RequirementCode.ToLower() == normalizedRequirementId,
                cancellationToken);

        if (record is null)
        {
            var definitionIfMissing = await FindRequirementDefinitionAsync(requirementId, cancellationToken);
            if (definitionIfMissing is not null)
            {
                return definitionIfMissing.Value.Requirement with
                {
                    CurrentStatus = RequirementStatusPending,
                    UploadedFileName = null,
                    UploadedFileUrl = null,
                    UploadedFileKind = null,
                    Notes = "No se encontro evidencia registrada para este requisito."
                };
            }

            throw new InvalidOperationException("EVIDENCE_NOT_FOUND");
        }

        if (string.Equals(record.Status, "approved", StringComparison.OrdinalIgnoreCase)
            || string.Equals(record.Status, "in_review", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("EVIDENCE_DELETE_NOT_ALLOWED_FOR_REVIEWED");
        }

        record.EvidenceUrl = null;
        record.Status = RequirementStatusPending;
        record.Notes = "Evidencia eliminada por el usuario.";
        record.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        var definition = await FindRequirementDefinitionAsync(requirementId, cancellationToken);
        if (definition is not null)
        {
            return definition.Value.Requirement with
            {
                CurrentStatus = record.Status,
                UploadedFileName = null,
                UploadedFileUrl = null,
                UploadedFileKind = null,
                Notes = record.Notes
            };
        }

        return new RegulationRequirementDto(
            Id: requirementId,
            LevelId: record.Level,
            Title: requirementId,
            Description: "No se encontro la informacion",
            Required: true,
            ActorType: "both",
            AcceptedFileTypes: ["pdf", "image", "document"],
            CurrentStatus: record.Status,
            UploadedFileName: null,
            UploadedFileUrl: null,
            UploadedFileKind: null,
            Notes: record.Notes);
    }

    public async Task<RegulationRequirementReviewPageDto> GetPendingRequirementReviewsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = dbContext.UserRegulationRequirements
            .AsNoTracking()
            .Include(item => item.User)
            .ThenInclude(user => user.Company)
            .Where(item => item.Status == "uploaded" || item.Status == "in_review")
            .OrderByDescending(item => item.UpdatedAt);

        var total = await query.CountAsync(cancellationToken);
        var records = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<RegulationRequirementReviewItemDto>(records.Count);
        foreach (var record in records)
        {
            items.Add(await BuildReviewItemDtoAsync(record, cancellationToken));
        }

        return new RegulationRequirementReviewPageDto(
            Items: items,
            Page: page,
            PageSize: pageSize,
            Total: total,
            HasMore: (page * pageSize) < total);
    }

    public async Task<RegulationRequirementDto> ReviewRequirementAsync(
        Guid adminUserId,
        Guid requirementRecordId,
        RegulationRequirementReviewRequestDto request,
        CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var targetStatus = NormalizeRequirementStatus(request.Status);
        if (targetStatus is not (RequirementStatusApproved or RequirementStatusRejected or RequirementStatusInReview))
        {
            throw new InvalidOperationException("INVALID_REVIEW_STATUS");
        }

        var requirement = await dbContext.UserRegulationRequirements
            .FirstOrDefaultAsync(item => item.Id == requirementRecordId, cancellationToken);
        if (requirement is null)
        {
            throw new InvalidOperationException("REQUIREMENT_RECORD_NOT_FOUND");
        }

        var current = requirement.Status.Trim().ToLowerInvariant();
        var isTransitionAllowed = targetStatus switch
        {
            RequirementStatusInReview => current is RequirementStatusUploaded or RequirementStatusRejected,
            RequirementStatusApproved => current is RequirementStatusUploaded or RequirementStatusInReview,
            RequirementStatusRejected => current is RequirementStatusUploaded or RequirementStatusInReview,
            _ => false
        };
        if (!isTransitionAllowed)
        {
            throw new InvalidOperationException("INVALID_REVIEW_TRANSITION");
        }

        if (targetStatus == RequirementStatusRejected && string.IsNullOrWhiteSpace(request.Notes))
        {
            throw new InvalidOperationException("REJECT_REQUIRES_NOTES");
        }

        var normalizedNotes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        requirement.Status = targetStatus;
        requirement.Notes = normalizedNotes;
        requirement.ExpiresAt = targetStatus == RequirementStatusApproved ? request.ExpiresAt : null;
        requirement.ReviewedByUserId = adminUserId;
        requirement.ReviewedAt = DateTime.UtcNow;
        requirement.UpdatedAt = DateTime.UtcNow;

        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = requirement.UserId,
            Actor = "admin",
            Action = "review_requirement",
            Allowed = targetStatus == RequirementStatusApproved,
            RequiredMinLevel = requirement.Level,
            ActorCurrentLevel = requirement.Level,
              BlockingReasonCode = targetStatus switch
              {
                  RequirementStatusApproved => "REVIEW_APPROVED",
                  RequirementStatusRejected => "REVIEW_REJECTED",
                  _ => "REVIEW_IN_REVIEW"
              },
            ContextResidueType = requirement.RequirementCode,
            ContextSector = "regulation",
            ContextProductType = null,
            ContextSpecificResidue = null,
            ContextQuantity = null,
            ContextUnit = null,
            ManualReviewRequired = false,
            CreatedAt = DateTime.UtcNow
        });

        if (targetStatus == RequirementStatusApproved)
        {
            await TryAutoPromoteUserLevelAsync(requirement.UserId, "admin", cancellationToken);
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new InvalidOperationException("REVIEW_CONFLICT_RETRY");
        }

        var definition = await FindRequirementDefinitionAsync(requirement.RequirementCode, cancellationToken);
        if (definition is null)
        {
            return new RegulationRequirementDto(
                Id: requirement.RequirementCode,
                LevelId: requirement.Level,
                Title: requirement.RequirementCode,
                Description: "No se encontro la informacion",
                Required: true,
                ActorType: "both",
                AcceptedFileTypes: ["pdf", "image", "document"],
                CurrentStatus: requirement.Status,
                UploadedFileName: ExtractFileName(requirement.EvidenceUrl),
                UploadedFileUrl: requirement.EvidenceUrl,
                UploadedFileKind: InferFileKindFromPath(ExtractFileName(requirement.EvidenceUrl)) ?? "document",
                  Notes: requirement.Notes);
        }

        return definition.Value.Requirement with
        {
            CurrentStatus = requirement.Status,
            UploadedFileName = ExtractFileName(requirement.EvidenceUrl),
            UploadedFileUrl = requirement.EvidenceUrl,
            UploadedFileKind = InferFileKindFromPath(ExtractFileName(requirement.EvidenceUrl)) ?? "document",
          Notes = requirement.Notes
          };
    }

    public async Task<RegulationUserLevelRecalculationDto> RecalculateUserLevelAsync(
        Guid userId,
        string auditActor,
        CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileAsync(userId, cancellationToken);
        var previous = (int)profile.CurrentLevel;

        await TryAutoPromoteUserLevelAsync(userId, string.IsNullOrWhiteSpace(auditActor) ? "admin" : auditActor, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new RegulationUserLevelRecalculationDto(
            UserId: userId,
            PreviousLevel: ToLevelSlug(previous),
            CurrentLevel: ToLevelSlug((int)profile.CurrentLevel),
            Changed: previous != (int)profile.CurrentLevel);
    }

    private async Task TryAutoPromoteUserLevelAsync(Guid userId, string auditActor, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileAsync(userId, cancellationToken);
        var user = await dbContext.Users
            .Include(item => item.Company)
            .Include(item => item.PersonProfile)
            .FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            return;
        }

        var actor = ResolveActor(user.Role.ToString(), null);
        var recalculatedLevel = 0;

        for (var level = 1; level <= 4; level++)
        {
            var missingRequired = await GetMissingRequiredLevelRequirementsAsync(
                userId,
                actor,
                level,
                cancellationToken);

            if (missingRequired.Count > 0)
            {
                break;
            }

            recalculatedLevel = level;
        }

        if (recalculatedLevel == (int)profile.CurrentLevel)
        {
            return;
        }

        var previousLevel = (int)profile.CurrentLevel;
        profile.CurrentLevel = (RegulationLevel)recalculatedLevel;
        profile.UpdatedAt = DateTime.UtcNow;

        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Actor = string.IsNullOrWhiteSpace(auditActor) ? "system" : auditActor,
            Action = recalculatedLevel > previousLevel ? "level_up" : "level_sync",
            Allowed = true,
            RequiredMinLevel = recalculatedLevel,
            ActorCurrentLevel = previousLevel,
            BlockingReasonCode = recalculatedLevel > previousLevel
                ? "AUTO_LEVEL_UPGRADED"
                : "AUTO_LEVEL_CORRECTED",
            ContextResidueType = null,
            ContextSector = "regulation",
            ContextProductType = null,
            ContextSpecificResidue = null,
            ContextQuantity = null,
            ContextUnit = null,
            ManualReviewRequired = false,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task<DownloadedFileResult> DownloadRequirementEvidenceAsync(
        Guid requirementRecordId,
        CancellationToken cancellationToken)
    {
        var requirement = await dbContext.UserRegulationRequirements
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == requirementRecordId, cancellationToken);

        if (requirement is null)
        {
            throw new InvalidOperationException("REQUIREMENT_RECORD_NOT_FOUND");
        }

        if (string.IsNullOrWhiteSpace(requirement.EvidenceUrl))
        {
            throw new InvalidOperationException("EVIDENCE_NOT_FOUND");
        }

        if (!TryParseStorageLocation(requirement.EvidenceUrl, out var bucket, out var storagePath))
        {
            throw new InvalidOperationException("EVIDENCE_URL_INVALID");
        }

        return await storageService.DownloadAsync(bucket, storagePath, cancellationToken);
    }

    public async Task<RegulationRequirementReviewPageDto> GetRequirementReviewHistoryAsync(
        int page,
        int pageSize,
        string? status,
        CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var normalizedStatus = status?.Trim().ToLowerInvariant();
        var query = dbContext.UserRegulationRequirements
            .AsNoTracking()
            .Include(item => item.User)
            .ThenInclude(user => user.Company)
            .Where(item => item.Status == "approved" || item.Status == "rejected");

        if (!string.IsNullOrWhiteSpace(normalizedStatus))
        {
            query = query.Where(item => item.Status == normalizedStatus);
        }

        query = query.OrderByDescending(item => item.UpdatedAt);
        var total = await query.CountAsync(cancellationToken);
        var records = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<RegulationRequirementReviewItemDto>(records.Count);
        foreach (var record in records)
        {
            items.Add(await BuildReviewItemDtoAsync(record, cancellationToken));
        }

        return new RegulationRequirementReviewPageDto(items, page, pageSize, total, (page * pageSize) < total);
    }

    public async Task<RegulationCatalogHealthDto> GetCatalogHealthAsync(CancellationToken cancellationToken)
    {
        var rows = await dbContext.RegulationLevelCatalogs
            .AsNoTracking()
            .OrderBy(item => item.Level)
            .ToListAsync(cancellationToken);

        var issues = new List<string>();
        if (rows.Count < 4)
        {
            issues.Add("CATALOG_LEVELS_MISSING");
        }

        var totalRequirements = 0;
        foreach (var row in rows)
        {
            var parsed = Deserialize<RegulationLevelDto>(row.PayloadJson);
            if (parsed is null)
            {
                issues.Add($"CATALOG_LEVEL_{row.Level}_INVALID_JSON");
                continue;
            }

            if (parsed.RequirementsForUpload.Count == 0)
            {
                issues.Add($"CATALOG_LEVEL_{row.Level}_NO_REQUIREMENTS");
            }

            totalRequirements += parsed.RequirementsForUpload.Count;
        }

        return new RegulationCatalogHealthDto(
            IsHealthy: issues.Count == 0,
            TotalLevels: rows.Count,
            TotalRequirements: totalRequirements,
            Issues: issues);
    }

    public async Task<RegulationAdminCatalogDto> GetAdminCatalogAsync(CancellationToken cancellationToken)
    {
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var levels = await BuildAdminLevelsAsync(version.Id, cancellationToken);
        return new RegulationAdminCatalogDto(version.VersionNumber, levels);
    }

    public async Task<RegulationAdminLevelDto> UpdateAdminLevelAsync(
        int levelId,
        RegulationAdminLevelUpdateDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        ValidateLevel(levelId);
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        await ReplaceLevelRulesAsync(version.Id, levelId, request, cancellationToken);
        await SaveAdminAuditAsync(adminUserId, "catalog_update_level", $"level:{levelId}", cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (await BuildAdminLevelsAsync(version.Id, cancellationToken)).First(item => item.LevelId == levelId);
    }

    public async Task<RegulationAdminRequirementDto> AddAdminRequirementAsync(
        int levelId,
        RegulationAdminRequirementUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        ValidateLevel(levelId);
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var entity = new RegulationLevelRequirementCatalog
        {
            Id = Guid.NewGuid(),
            VersionId = version.Id,
            Level = levelId,
            RequirementCode = SafeCode(request.RequirementCode),
            Title = SafeText(request.Title),
            Description = SafeText(request.Description),
            IsRequired = request.Required,
            ActorType = NormalizeActorType(request.ActorType),
            AcceptedFileTypesJson = JsonSerializer.Serialize(request.AcceptedFileTypes ?? []),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.RegulationLevelRequirementsCatalog.Add(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_add_requirement", entity.RequirementCode, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminRequirementDto(entity);
    }

    public async Task<RegulationAdminRequirementDto> UpdateAdminRequirementAsync(
        Guid requirementId,
        RegulationAdminRequirementUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationLevelRequirementsCatalog
            .FirstOrDefaultAsync(item => item.Id == requirementId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_REQUIREMENT_NOT_FOUND");

        entity.RequirementCode = SafeCode(request.RequirementCode);
        entity.Title = SafeText(request.Title);
        entity.Description = SafeText(request.Description);
        entity.IsRequired = request.Required;
        entity.ActorType = NormalizeActorType(request.ActorType);
        entity.AcceptedFileTypesJson = JsonSerializer.Serialize(request.AcceptedFileTypes ?? []);
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await SaveAdminAuditAsync(adminUserId, "catalog_patch_requirement", entity.RequirementCode, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminRequirementDto(entity);
    }

    public async Task DeleteAdminRequirementAsync(Guid requirementId, Guid adminUserId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationLevelRequirementsCatalog
            .FirstOrDefaultAsync(item => item.Id == requirementId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_REQUIREMENT_NOT_FOUND");
        var detail = entity.RequirementCode;
        dbContext.RegulationLevelRequirementsCatalog.Remove(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_delete_requirement", detail, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<RegulationAdminAllowedResidueDto> AddAdminAllowedResidueAsync(
        int levelId,
        RegulationAdminAllowedResidueUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        ValidateLevel(levelId);
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var entity = new RegulationAllowedResidueCatalog
        {
            Id = Guid.NewGuid(),
            VersionId = version.Id,
            Level = levelId,
            CategoryId = SafeCode(request.CategoryId),
            CategoryTitle = SafeText(request.CategoryTitle),
            ResidueName = SafeText(request.ResidueName),
            QuantityMin = request.QuantityMin,
            QuantityMax = request.QuantityMax,
            Unit = request.Unit?.Trim(),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.RegulationAllowedResiduesCatalog.Add(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_add_allowed_residue", entity.ResidueName, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminAllowedResidueDto(entity);
    }

    public async Task<RegulationAdminAllowedResidueDto> UpdateAdminAllowedResidueAsync(
        Guid residueId,
        RegulationAdminAllowedResidueUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationAllowedResiduesCatalog
            .FirstOrDefaultAsync(item => item.Id == residueId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_ALLOWED_RESIDUE_NOT_FOUND");

        entity.CategoryId = SafeCode(request.CategoryId);
        entity.CategoryTitle = SafeText(request.CategoryTitle);
        entity.ResidueName = SafeText(request.ResidueName);
        entity.QuantityMin = request.QuantityMin;
        entity.QuantityMax = request.QuantityMax;
        entity.Unit = request.Unit?.Trim();
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await SaveAdminAuditAsync(adminUserId, "catalog_patch_allowed_residue", entity.ResidueName, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminAllowedResidueDto(entity);
    }

    public async Task DeleteAdminAllowedResidueAsync(Guid residueId, Guid adminUserId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationAllowedResiduesCatalog
            .FirstOrDefaultAsync(item => item.Id == residueId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_ALLOWED_RESIDUE_NOT_FOUND");
        var detail = entity.ResidueName;
        dbContext.RegulationAllowedResiduesCatalog.Remove(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_delete_allowed_residue", detail, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<RegulationAdminNormativeDto> AddAdminNormativeAsync(
        int levelId,
        RegulationAdminNormativeUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        ValidateLevel(levelId);
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var entity = new RegulationNormativeReferenceCatalog
        {
            Id = Guid.NewGuid(),
            VersionId = version.Id,
            Level = levelId,
            Code = SafeCode(request.Code),
            Title = SafeText(request.Title),
            Article = request.Article?.Trim(),
            ReferenceUrl = request.ReferenceUrl?.Trim(),
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.RegulationNormativeReferencesCatalog.Add(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_add_normative", entity.Code, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminNormativeDto(entity);
    }

    public async Task<RegulationAdminNormativeDto> UpdateAdminNormativeAsync(
        Guid normativeId,
        RegulationAdminNormativeUpsertDto request,
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationNormativeReferencesCatalog
            .FirstOrDefaultAsync(item => item.Id == normativeId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_NORMATIVE_NOT_FOUND");

        entity.Code = SafeCode(request.Code);
        entity.Title = SafeText(request.Title);
        entity.Article = request.Article?.Trim();
        entity.ReferenceUrl = request.ReferenceUrl?.Trim();
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await SaveAdminAuditAsync(adminUserId, "catalog_patch_normative", entity.Code, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return ToAdminNormativeDto(entity);
    }

    public async Task DeleteAdminNormativeAsync(Guid normativeId, Guid adminUserId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.RegulationNormativeReferencesCatalog
            .FirstOrDefaultAsync(item => item.Id == normativeId, cancellationToken)
            ?? throw new InvalidOperationException("REGULATION_NORMATIVE_NOT_FOUND");
        var detail = entity.Code;
        dbContext.RegulationNormativeReferencesCatalog.Remove(entity);
        await SaveAdminAuditAsync(adminUserId, "catalog_delete_normative", detail, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<RegulationEvidencePrecheckResultDto> VerifyListingEvidenceAsync(
        Guid userId,
        string userRole,
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken)
    {
        var regulation = await ValidateOperationAsync(
            userId,
            userRole,
            new RegulationValidateOperationRequestDto(
                Action: "publish",
                Actor: "seller",
                ResidueType: request.ResidueType,
                Sector: request.Sector,
                ProductType: request.ProductType,
                SpecificResidue: request.SpecificResidue,
                Quantity: request.Quantity,
                Unit: request.Unit),
            cancellationToken);

        var requiredLevelNumber = ParseLevelNumber(regulation.RequiredMinLevel);
        var (levelRestrictions, levelAllowedResidues) = await GetLevelEvidenceContextAsync(requiredLevelNumber, cancellationToken);

        var result = await BuildEvidenceVerificationResultAsync(
            request with
            {
                ContextRequiredLevel = regulation.RequiredMinLevel,
                ContextRestrictions = levelRestrictions,
                ContextAllowedResidues = levelAllowedResidues
            },
            cancellationToken);
        var evidenceAllowed = result.IsConsistent
            && !result.ManualReviewRequired
            && !string.Equals(result.RiskLevel, "high", StringComparison.OrdinalIgnoreCase);

        var finalAllowed = regulation.Allowed && evidenceAllowed;
        var blockingCode = !regulation.Allowed
            ? regulation.BlockingReasonCode ?? "REGULATION_BLOCKED"
            : (request.MediaUrls is null || request.MediaUrls.Count == 0
                ? "EVIDENCE_VERIFICATION_REQUIRED"
                : "EVIDENCE_NOT_CONSISTENT");
        var blockingMessage = !regulation.Allowed
            ? regulation.BlockingMessage
            : result.Message;

        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Actor = FitForDb("seller", 40) ?? "seller",
            Action = FitForDb("ai_evidence_check", 80) ?? "ai_evidence_check",
            Allowed = finalAllowed,
            RequiredMinLevel = ParseLevelNumber(regulation.RequiredMinLevel),
            ActorCurrentLevel = ParseLevelNumber(regulation.ActorCurrentLevel),
            BlockingReasonCode = FitForDb(finalAllowed ? "AI_EVIDENCE_OK" : blockingCode, 80),
            ContextResidueType = FitForDb(request.ResidueType, 120),
            ContextSector = FitForDb(request.Sector, 120),
            ContextProductType = FitForDb(request.ProductType, 120),
            ContextSpecificResidue = FitForDb(request.SpecificResidue, 200),
            ContextQuantity = request.Quantity,
            ContextUnit = FitForDb(request.Unit, 30),
            ManualReviewRequired = !evidenceAllowed,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new RegulationEvidencePrecheckResultDto(
            Regulation: regulation,
            Evidence: result,
            FinalAllowed: finalAllowed,
            BlockingReasonCode: finalAllowed ? null : blockingCode,
            BlockingMessage: finalAllowed
                ? "Verificación completada. Puedes publicar."
                : blockingMessage);
    }

    private async Task<RegulationEvidenceVerificationResultDto> BuildEvidenceVerificationResultAsync(
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken)
    {
        var mediaUrls = request.MediaUrls?
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .ToArray() ?? [];

        if (_aiEvidenceOptions.Enabled)
        {
            try
            {
                var aiResult = await evidenceAiVerifier.VerifyAsync(request with { MediaUrls = mediaUrls }, cancellationToken);
                if (aiResult is not null)
                {
                    return NormalizeEvidenceResult(aiResult, request.SpecificResidue);
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "AI evidence verification fallback triggered.");
            }

            return NormalizeEvidenceResult(new RegulationEvidenceVerificationResultDto(
                IsConsistent: false,
                Confidence: 0.0m,
                RiskLevel: "high",
                SuggestedResidue: request.SpecificResidue,
                RiskFlags: ["ai-verification-unavailable"],
                ManualReviewRequired: true,
                Message: "No se pudo completar la verificacion IA de evidencia. Intenta nuevamente."
            ), request.SpecificResidue);
        }

        return NormalizeEvidenceResult(new RegulationEvidenceVerificationResultDto(
            IsConsistent: false,
            Confidence: 0.0m,
            RiskLevel: "high",
            SuggestedResidue: request.SpecificResidue,
            RiskFlags: ["ai-verification-disabled"],
            ManualReviewRequired: true,
            Message: "La verificacion IA es obligatoria y no esta disponible."
        ), request.SpecificResidue);
    }

    private async Task<RegulationEvidenceVerificationResultDto> BuildHeuristicEvidenceResultAsync(
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken)
    {
        var normalized = string.Join(' ', new[] { request.SpecificResidue, request.ResidueType, request.Sector, request.ProductType, request.ShortDescription }
            .Where(item => !string.IsNullOrWhiteSpace(item)))
            .ToLowerInvariant();

        var riskFlags = new List<string> { "ai-fallback" };
        var confidence = 0.82m;
        var risk = "low";
        var isConsistent = true;

        if (request.MediaUrls is null || request.MediaUrls.Count == 0)
        {
            riskFlags.Add("no-media");
            confidence = 0.30m;
            risk = "high";
            isConsistent = false;
        }

        if (await ContainsHighRiskResidueAsync(normalized, cancellationToken))
        {
            riskFlags.Add("hazardous-keyword");
            confidence = Math.Min(confidence, 0.60m);
            risk = "high";
        }

        if (string.IsNullOrWhiteSpace(normalized))
        {
            riskFlags.Add("insufficient-context");
            confidence = 0.40m;
            risk = "high";
            isConsistent = false;
        }

        var manualReviewRequired = string.Equals(risk, "high", StringComparison.OrdinalIgnoreCase) || confidence < _aiEvidenceOptions.ConfidenceThreshold;
        var message = manualReviewRequired
            ? "Se detectaron señales de riesgo. Recomendamos revisión manual."
            : "La evidencia es consistente para continuar.";

        return NormalizeEvidenceResult(new RegulationEvidenceVerificationResultDto(
            IsConsistent: isConsistent,
            Confidence: confidence,
            RiskLevel: risk,
            SuggestedResidue: request.SpecificResidue,
            RiskFlags: riskFlags,
            ManualReviewRequired: manualReviewRequired,
            Message: message), request.SpecificResidue);
    }

    private RegulationEvidenceVerificationResultDto NormalizeEvidenceResult(
        RegulationEvidenceVerificationResultDto input,
        string? suggestedResidueFallback)
    {
        var confidence = Math.Clamp(input.Confidence, 0m, 1m);
        var risk = NormalizeRiskLevel(input.RiskLevel);
        var riskFlags = input.RiskFlags
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var manualReviewRequired = input.ManualReviewRequired
            || string.Equals(risk, "high", StringComparison.OrdinalIgnoreCase)
            || confidence < _aiEvidenceOptions.ConfidenceThreshold;

        var message = string.IsNullOrWhiteSpace(input.Message)
            ? (manualReviewRequired
                ? "Se detectaron señales de riesgo. Recomendamos revisión manual."
                : "La evidencia es consistente para continuar.")
            : input.Message.Trim();

        return new RegulationEvidenceVerificationResultDto(
            IsConsistent: input.IsConsistent,
            Confidence: confidence,
            RiskLevel: risk,
            SuggestedResidue: string.IsNullOrWhiteSpace(input.SuggestedResidue)
                ? suggestedResidueFallback
                : input.SuggestedResidue.Trim(),
            RiskFlags: riskFlags,
            ManualReviewRequired: manualReviewRequired,
            Message: message);
    }

    private static string NormalizeRiskLevel(string? riskLevel)
    {
        var risk = riskLevel?.Trim().ToLowerInvariant() ?? string.Empty;
        return risk is "low" or "medium" or "high" ? risk : "medium";
    }

    private static int ParseLevelNumber(string? levelSlug)
    {
        var raw = levelSlug?.Trim().ToLowerInvariant() ?? string.Empty;
        if (!raw.StartsWith("level", StringComparison.Ordinal))
        {
            return 0;
        }

        return int.TryParse(raw[5..], out var parsed)
            ? Math.Clamp(parsed, 0, 4)
            : 0;
    }

    private async Task<(IReadOnlyCollection<string> Restrictions, IReadOnlyCollection<string> AllowedResidues)> GetLevelEvidenceContextAsync(
        int level,
        CancellationToken cancellationToken)
    {
        if (level <= 0)
        {
            return ([], []);
        }

        var catalog = await dbContext.RegulationLevelCatalogs
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Level == level, cancellationToken);

        var restrictions = new List<string>();
        if (catalog is not null)
        {
            var dto = Deserialize<RegulationLevelDto>(catalog.PayloadJson);
            if (dto is not null)
            {
                restrictions.AddRange(dto.Restrictions ?? []);
            }
        }

        var allowedResidues = await dbContext.RegulationAllowedResiduesCatalog
            .AsNoTracking()
            .Where(item => item.Level == level && item.IsActive)
            .OrderBy(item => item.SortOrder)
            .Select(item => item.ResidueName)
            .Take(25)
            .ToListAsync(cancellationToken);

        return (restrictions.Distinct(StringComparer.OrdinalIgnoreCase).ToArray(), allowedResidues);
    }
    private async Task<UserRegulationProfile> EnsureProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await dbContext.UserRegulationProfiles
            .FirstOrDefaultAsync(item => item.UserId == userId, cancellationToken);

        if (profile is not null)
        {
            var levelNumber = (int)profile.CurrentLevel;
            if (levelNumber < 0 || levelNumber > 4)
            {
                profile.CurrentLevel = RegulationLevel.Level0;
                profile.UpdatedAt = DateTime.UtcNow;

                dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Actor = "system",
                    Action = "profile_consistency_check",
                    Allowed = false,
                    RequiredMinLevel = 1,
                    ActorCurrentLevel = 0,
                    BlockingReasonCode = "INVALID_PROFILE_LEVEL_NORMALIZED",
                    ManualReviewRequired = false,
                    CreatedAt = DateTime.UtcNow
                });

                await dbContext.SaveChangesAsync(cancellationToken);
            }
            return profile;
        }

        profile = new UserRegulationProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CurrentLevel = RegulationLevel.Level0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        dbContext.UserRegulationProfiles.Add(profile);
        await dbContext.SaveChangesAsync(cancellationToken);
        return profile;
    }

    private async Task<IReadOnlyCollection<string>> GetMissingRequirementsAsync(
        Guid userId,
        int requiredLevel,
        string actor,
        CancellationToken cancellationToken)
    {
        var requirements = await dbContext.UserRegulationRequirements
            .Where(item => item.UserId == userId && item.Level == requiredLevel)
            .ToListAsync(cancellationToken);

        if (requirements.Count == 0)
        {
            return [$"No tienes requisitos cargados para {ToLevelSlug(requiredLevel)} ({actor})."];
        }

        return requirements
            .Where(item => !string.Equals(item.Status, "approved", StringComparison.OrdinalIgnoreCase))
            .Select(item => item.RequirementCode)
            .ToArray();
    }

    private static IReadOnlyCollection<string> GetMissingBaseRequirements(User user, string actor)
    {
        var missing = new List<string>();

        if (string.Equals(actor, "seller", StringComparison.OrdinalIgnoreCase))
        {
            if (user.ProfileType == ProfileType.Person)
            {
                if (string.IsNullOrWhiteSpace(user.PersonProfile?.DocumentNumber))
                {
                    missing.Add("person.documentNumber");
                }

                if (string.IsNullOrWhiteSpace(user.PersonProfile?.Address))
                {
                    missing.Add("person.address");
                }

                if (string.IsNullOrWhiteSpace(user.PersonProfile?.MobilePhone))
                {
                    missing.Add("person.mobilePhone");
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(user.Company?.Ruc))
                {
                    missing.Add("company.ruc");
                }

                if (string.IsNullOrWhiteSpace(user.Company?.Address))
                {
                    missing.Add("company.address");
                }

                if (string.IsNullOrWhiteSpace(user.Company?.MobilePhone))
                {
                    missing.Add("company.mobilePhone");
                }
            }
        }
        else
        {
            if (string.IsNullOrWhiteSpace(user.Company?.Ruc))
            {
                missing.Add("company.ruc");
            }

            if (string.IsNullOrWhiteSpace(user.Company?.Address))
            {
                missing.Add("company.address");
            }

            if (string.IsNullOrWhiteSpace(user.Company?.MobilePhone))
            {
                missing.Add("company.mobilePhone");
            }
        }

        return missing;
    }

    private async Task<IReadOnlyCollection<string>> GetMissingRequiredLevelRequirementsAsync(
        Guid userId,
        string actor,
        int requiredLevel,
        CancellationToken cancellationToken)
    {
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var normalizedActor = NormalizeActorType(actor);
        var requiredCodes = await dbContext.RegulationLevelRequirementsCatalog
            .AsNoTracking()
            .Where(item =>
                item.VersionId == version.Id
                && item.IsActive
                && item.IsRequired
                && item.Level <= requiredLevel
                && (item.ActorType == "both" || item.ActorType == normalizedActor))
            .OrderBy(item => item.Level)
            .ThenBy(item => item.SortOrder)
            .Select(item => item.RequirementCode)
            .Distinct()
            .ToArrayAsync(cancellationToken);

        if (requiredCodes.Length == 0)
        {
            return [];
        }

        var requirements = await dbContext.UserRegulationRequirements
            .Where(item => item.UserId == userId && requiredCodes.Contains(item.RequirementCode))
            .ToListAsync(cancellationToken);

        var missing = requiredCodes
            .Where(code => requirements.All(item =>
                !string.Equals(item.RequirementCode, code, StringComparison.OrdinalIgnoreCase)
                || !string.Equals(item.Status, "approved", StringComparison.OrdinalIgnoreCase)
                || (item.ExpiresAt.HasValue && item.ExpiresAt.Value <= DateTime.UtcNow)))
            .ToArray();

        return missing;
    }

    private static string ResolveActor(string userRole, string? explicitActor)
    {
        if (!string.IsNullOrWhiteSpace(explicitActor))
        {
            return explicitActor.Trim().ToLowerInvariant();
        }

        return string.Equals(userRole, "seller", StringComparison.OrdinalIgnoreCase) ? "seller" : "buyer";
    }

    private async Task<int> ClassifyRequiredLevelAsync(
        RegulationValidateOperationRequestDto request,
        CancellationToken cancellationToken)
    {
        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var pieces = new[] { request.ResidueType, request.Sector, request.ProductType, request.SpecificResidue };
        var normalized = string.Join(
                ' ',
                pieces.Where(item => !string.IsNullOrWhiteSpace(item)))
            .Trim()
            .ToLowerInvariant();

        var residues = await dbContext.RegulationAllowedResiduesCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == version.Id && item.IsActive)
            .ToListAsync(cancellationToken);

        if (residues.Count == 0)
        {
            return 1;
        }

        if (string.IsNullOrWhiteSpace(normalized))
        {
            return residues.Min(item => item.Level);
        }

        var matched = residues
            .Where(item =>
                normalized.Contains(item.ResidueName.ToLowerInvariant())
                || normalized.Contains(item.CategoryTitle.ToLowerInvariant())
                || normalized.Contains(item.CategoryId.ToLowerInvariant()))
            .Select(item => item.Level)
            .ToArray();

        if (matched.Length == 0)
        {
            return residues.Min(item => item.Level);
        }

        return matched.Max();
    }

    private static string NormalizeRequirementStatus(string? status)
    {
        var normalized = status?.Trim().ToLowerInvariant() ?? string.Empty;
        if (normalized.Length > 40)
        {
            throw new InvalidOperationException("INVALID_REVIEW_STATUS");
        }

        return normalized;
    }

    private async Task<bool> ContainsHighRiskResidueAsync(string normalizedContext, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(normalizedContext))
        {
            return false;
        }

        var version = await GetOrCreateActiveCatalogVersionAsync(cancellationToken);
        var highRiskResidues = await dbContext.RegulationAllowedResiduesCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == version.Id && item.IsActive && item.Level >= 4)
            .Select(item => item.ResidueName)
            .ToListAsync(cancellationToken);

        return highRiskResidues.Any(name =>
            !string.IsNullOrWhiteSpace(name)
            && normalizedContext.Contains(name.ToLowerInvariant()));
    }

    private async Task SaveAuditAsync(
        Guid userId,
        string actor,
        RegulationValidateOperationRequestDto request,
        RegulationValidationResultDto result,
        CancellationToken cancellationToken)
    {
        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Actor = FitForDb(actor, 40) ?? "system",
            Action = FitForDb(request.Action, 80) ?? "unknown",
            Allowed = result.Allowed,
            RequiredMinLevel = ToLevelNumber(result.RequiredMinLevel),
            ActorCurrentLevel = ToLevelNumber(result.ActorCurrentLevel),
            BlockingReasonCode = FitForDb(result.BlockingReasonCode, 80),
            ContextResidueType = FitForDb(request.ResidueType, 120),
            ContextSector = FitForDb(request.Sector, 120),
            ContextProductType = FitForDb(request.ProductType, 120),
            ContextSpecificResidue = FitForDb(request.SpecificResidue, 200),
            ContextQuantity = request.Quantity,
            ContextUnit = FitForDb(request.Unit, 30),
            ManualReviewRequired = result.ManualReviewRequired,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<RegulationLevelDto> ApplyRequirementStatusesAsync(
        RegulationLevelDto dto,
        IReadOnlyCollection<UserRegulationRequirement> requirementStates,
        CancellationToken cancellationToken)
    {
        var requirements = new List<RegulationRequirementDto>(dto.RequirementsForUpload.Count);
        foreach (var req in dto.RequirementsForUpload)
        {
            var persisted = requirementStates.FirstOrDefault(item =>
                item.Level == req.LevelId
                && string.Equals(item.RequirementCode, req.Id, StringComparison.OrdinalIgnoreCase));

            var evidenceUrl = persisted?.EvidenceUrl;
            if (!string.IsNullOrWhiteSpace(evidenceUrl)
                && TryParseStorageLocation(evidenceUrl, out var bucket, out var storagePath))
            {
                try
                {
                    evidenceUrl = await storageService.CreateSignedUrlAsync(bucket, storagePath, 3600, cancellationToken);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to create signed URL for requirement evidence. Requirement={Requirement}", req.Id);
                }
            }

            var evidenceName = ExtractFileName(persisted?.EvidenceUrl);
            var evidenceKind = InferFileKindFromPath(evidenceName);
            requirements.Add(req with
            {
                CurrentStatus = persisted?.Status ?? req.CurrentStatus,
                UploadedFileName = evidenceName ?? req.UploadedFileName,
                UploadedFileUrl = evidenceUrl ?? req.UploadedFileUrl,
                UploadedFileKind = evidenceKind ?? req.UploadedFileKind,
                Notes = persisted?.Notes ?? req.Notes
            });
        }

        return dto with
        {
            RequirementsForUpload = requirements
        };
    }

    private async Task<(int LevelId, RegulationRequirementDto Requirement)?> FindRequirementDefinitionAsync(
        string requirementId,
        CancellationToken cancellationToken)
    {
        var levels = await GetLevelsAsync(Guid.Empty, cancellationToken);
        foreach (var level in levels)
        {
            var requirement = level.RequirementsForUpload
                .FirstOrDefault(item => string.Equals(item.Id, requirementId, StringComparison.OrdinalIgnoreCase));
            if (requirement is not null)
            {
                return (level.Id, requirement);
            }
        }

        return null;
    }

    private async Task<RegulationRequirementReviewItemDto> BuildReviewItemDtoAsync(
        UserRegulationRequirement record,
        CancellationToken cancellationToken)
    {
        var definition = await FindRequirementDefinitionAsync(record.RequirementCode, cancellationToken);
        var signedEvidenceUrl = await BuildSignedEvidenceUrlAsync(record.EvidenceUrl, cancellationToken);
        var uploadedFileName = ResolveUploadedFileName(record);
        var uploadedFileKind = InferFileKindFromPath(uploadedFileName);
        var reviewDeadlineAt = ResolveReviewDeadlineAt(record);
        var now = DateTime.UtcNow;
        var requesterName = ResolveRequesterName(record);
        var companyName = ResolveCompanyName(record, requesterName);

        return new RegulationRequirementReviewItemDto(
            RequirementRecordId: record.Id,
            UserId: record.UserId,
            RequesterName: requesterName,
            CompanyName: companyName,
            Ruc: record.User.Company?.Ruc,
            LevelId: record.Level,
            RequirementCode: record.RequirementCode,
            RequirementTitle: definition?.Requirement.Title ?? record.RequirementCode,
            ActorType: definition?.Requirement.ActorType ?? "both",
            CurrentStatus: record.Status,
            UploadedFileName: uploadedFileName,
            UploadedFileKind: uploadedFileKind,
            EvidenceUrl: signedEvidenceUrl,
            Notes: record.Notes,
            ReviewDeadlineAt: reviewDeadlineAt,
            IsOverdue: reviewDeadlineAt.HasValue
                && reviewDeadlineAt.Value <= now
                && (string.Equals(record.Status, "uploaded", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(record.Status, "in_review", StringComparison.OrdinalIgnoreCase)),
            ApprovalExpiresAt: record.ExpiresAt,
            CreatedAt: record.CreatedAt,
            UpdatedAt: record.UpdatedAt);
    }

    private async Task<string?> BuildSignedEvidenceUrlAsync(string? evidenceUrl, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(evidenceUrl))
        {
            return null;
        }

        if (!TryParseStorageLocation(evidenceUrl, out var bucket, out var storagePath))
        {
            return evidenceUrl;
        }

        try
        {
            return await storageService.CreateSignedUrlAsync(bucket, storagePath, 3600, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to create signed URL for regulation review evidence. EvidenceUrl={EvidenceUrl}", evidenceUrl);
            return evidenceUrl;
        }
    }

    private DateTime? ResolveReviewDeadlineAt(UserRegulationRequirement record)
    {
        if (!string.Equals(record.Status, "uploaded", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(record.Status, "in_review", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var deadlineHours = Math.Clamp(_regulationReviewOptions.PendingReviewDeadlineHours, 1, 24 * 30);
        return record.UpdatedAt.AddHours(deadlineHours);
    }

    private static string ResolveRequesterName(UserRegulationRequirement record)
    {
        return string.IsNullOrWhiteSpace(record.User.FullName)
            ? "Solicitante sin nombre"
            : record.User.FullName.Trim();
    }

    private static string ResolveCompanyName(UserRegulationRequirement record, string requesterName)
    {
        if (!string.IsNullOrWhiteSpace(record.User.Company?.BusinessName))
        {
            return record.User.Company.BusinessName.Trim();
        }

        return requesterName;
    }

    private static string ResolveUploadedFileName(UserRegulationRequirement record)
    {
        var fileName = ExtractFileName(record.EvidenceUrl);
        if (!string.IsNullOrWhiteSpace(fileName))
        {
            return fileName;
        }

        const string prefix = "Archivo cargado:";
        if (!string.IsNullOrWhiteSpace(record.Notes)
            && record.Notes.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            var fromNotes = record.Notes[prefix.Length..].Trim();
            if (!string.IsNullOrWhiteSpace(fromNotes))
            {
                return fromNotes;
            }
        }

        return "Archivo adjunto";
    }

    private async Task<RegulationCatalogVersion> GetOrCreateActiveCatalogVersionAsync(CancellationToken cancellationToken)
    {
        var active = await dbContext.RegulationCatalogVersions
            .FirstOrDefaultAsync(item => item.IsActive, cancellationToken);
        if (active is not null)
        {
            return active;
        }

        var now = DateTime.UtcNow;
        var created = new RegulationCatalogVersion
        {
            Id = Guid.NewGuid(),
            VersionNumber = 1,
            IsActive = true,
            Notes = "Auto-created",
            CreatedAt = now,
            UpdatedAt = now
        };
        dbContext.RegulationCatalogVersions.Add(created);
        await dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    private async Task<IReadOnlyCollection<RegulationAdminLevelDto>> BuildAdminLevelsAsync(Guid versionId, CancellationToken cancellationToken)
    {
        var payloads = await dbContext.RegulationLevelCatalogs
            .AsNoTracking()
            .OrderBy(item => item.Level)
            .ToListAsync(cancellationToken);

        var requirements = await dbContext.RegulationLevelRequirementsCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == versionId)
            .OrderBy(item => item.Level).ThenBy(item => item.SortOrder)
            .ToListAsync(cancellationToken);

        var residues = await dbContext.RegulationAllowedResiduesCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == versionId)
            .OrderBy(item => item.Level).ThenBy(item => item.SortOrder)
            .ToListAsync(cancellationToken);

        var rules = await dbContext.RegulationLevelRulesCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == versionId && item.IsActive)
            .OrderBy(item => item.Level).ThenBy(item => item.SortOrder)
            .ToListAsync(cancellationToken);

        var normatives = await dbContext.RegulationNormativeReferencesCatalog
            .AsNoTracking()
            .Where(item => item.VersionId == versionId)
            .OrderBy(item => item.Level).ThenBy(item => item.SortOrder)
            .ToListAsync(cancellationToken);

        var result = new List<RegulationAdminLevelDto>(4);
        for (var level = 1; level <= 4; level++)
        {
            var parsed = Deserialize<RegulationLevelDto>(payloads.FirstOrDefault(item => item.Level == level)?.PayloadJson ?? "{}");
            var levelRequirements = requirements.Where(item => item.Level == level).Select(ToAdminRequirementDto).ToArray();
            var levelResidues = residues.Where(item => item.Level == level).Select(ToAdminAllowedResidueDto).ToArray();
            var levelNormatives = normatives.Where(item => item.Level == level).Select(ToAdminNormativeDto).ToArray();

            result.Add(new RegulationAdminLevelDto(
                LevelId: level,
                Slug: parsed?.Slug ?? $"level{level}",
                Title: parsed?.Title ?? $"Nivel {level}",
                Subtitle: parsed?.Subtitle ?? "No se encontro la informacion",
                RegularizationLabel: parsed?.RegularizationLabel ?? "No se encontro la informacion",
                RiskLevel: parsed?.RiskLevel ?? "No se encontro la informacion",
                Fiscalization: parsed?.Fiscalization ?? "No se encontro la informacion",
                Objective: ReadRuleItems(rules, level, "objective", parsed?.Objective),
                Restrictions: ReadRuleItems(rules, level, "restriction", parsed?.Restrictions),
                PlatformAllowed: ReadRuleItems(rules, level, "platform_allowed", parsed?.PlatformValidations?.Allowed),
                PlatformRequired: ReadRuleItems(rules, level, "platform_required", parsed?.PlatformValidations?.Required),
                TraceabilityItems: ReadRuleItems(rules, level, "traceability", parsed?.Traceability?.Items),
                LegalRiskItems: ReadRuleItems(rules, level, "legal_risk", parsed?.LegalRisks?.Items),
                Requirements: levelRequirements,
                AllowedResidues: levelResidues,
                Normatives: levelNormatives));
        }

        return result;
    }

    private static IReadOnlyCollection<string> ReadRuleItems(
        IReadOnlyCollection<RegulationLevelRuleCatalog> rules,
        int level,
        string group,
        IReadOnlyCollection<string>? fallback)
    {
        var items = rules
            .Where(item => item.Level == level && string.Equals(item.RuleGroup, group, StringComparison.OrdinalIgnoreCase))
            .Select(item => item.ItemText)
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .ToArray();
        return items.Length > 0 ? items : (fallback ?? ["No se encontro la informacion"]);
    }

    private async Task ReplaceLevelRulesAsync(
        Guid versionId,
        int levelId,
        RegulationAdminLevelUpdateDto request,
        CancellationToken cancellationToken)
    {
        var existing = await dbContext.RegulationLevelRulesCatalog
            .Where(item => item.VersionId == versionId && item.Level == levelId)
            .ToListAsync(cancellationToken);
        dbContext.RegulationLevelRulesCatalog.RemoveRange(existing);

        var now = DateTime.UtcNow;
        AddRuleEntries(versionId, levelId, "objective", request.Objective ?? [], now);
        AddRuleEntries(versionId, levelId, "restriction", request.Restrictions ?? [], now);
        AddRuleEntries(versionId, levelId, "platform_allowed", request.PlatformAllowed ?? [], now);
        AddRuleEntries(versionId, levelId, "platform_required", request.PlatformRequired ?? [], now);
        AddRuleEntries(versionId, levelId, "traceability", request.TraceabilityItems ?? [], now);
        AddRuleEntries(versionId, levelId, "legal_risk", request.LegalRiskItems ?? [], now);

        var legacyRow = await dbContext.RegulationLevelCatalogs.FirstOrDefaultAsync(item => item.Level == levelId, cancellationToken);
        if (legacyRow is not null)
        {
            var parsed = Deserialize<RegulationLevelDto>(legacyRow.PayloadJson);
            if (parsed is not null)
            {
                var updated = parsed with
                {
                    Title = string.IsNullOrWhiteSpace(request.Title) ? parsed.Title : request.Title.Trim(),
                    Subtitle = string.IsNullOrWhiteSpace(request.Subtitle) ? parsed.Subtitle : request.Subtitle.Trim(),
                    RegularizationLabel = string.IsNullOrWhiteSpace(request.RegularizationLabel) ? parsed.RegularizationLabel : request.RegularizationLabel.Trim(),
                    RiskLevel = string.IsNullOrWhiteSpace(request.RiskLevel) ? parsed.RiskLevel : request.RiskLevel.Trim(),
                    Fiscalization = string.IsNullOrWhiteSpace(request.Fiscalization) ? parsed.Fiscalization : request.Fiscalization.Trim()
                };
                legacyRow.PayloadJson = JsonSerializer.Serialize(updated);
                legacyRow.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    private void AddRuleEntries(Guid versionId, int level, string group, IEnumerable<string> values, DateTime now)
    {
        var index = 0;
        foreach (var value in values.Where(item => !string.IsNullOrWhiteSpace(item)))
        {
            dbContext.RegulationLevelRulesCatalog.Add(new RegulationLevelRuleCatalog
            {
                Id = Guid.NewGuid(),
                VersionId = versionId,
                Level = level,
                RuleGroup = group,
                ItemText = value.Trim(),
                SortOrder = index++,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    private async Task SaveAdminAuditAsync(Guid adminUserId, string action, string detail, CancellationToken cancellationToken)
    {
        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = adminUserId,
            Actor = FitForDb("admin", 40) ?? "admin",
            Action = FitForDb(action, 80) ?? "catalog_update",
            Allowed = true,
            RequiredMinLevel = 0,
            ActorCurrentLevel = 0,
            BlockingReasonCode = FitForDb("CATALOG_UPDATED", 80),
            ContextResidueType = FitForDb(detail, 120),
            ContextSector = FitForDb("regulation-admin", 120),
            ContextProductType = null,
            ContextSpecificResidue = null,
            ContextQuantity = null,
            ContextUnit = null,
            ManualReviewRequired = false,
            CreatedAt = DateTime.UtcNow
        });

        await Task.CompletedTask;
    }

    private static string? FitForDb(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }

    private static RegulationAdminRequirementDto ToAdminRequirementDto(RegulationLevelRequirementCatalog entity)
    {
        return new RegulationAdminRequirementDto(
            Id: entity.Id,
            LevelId: entity.Level,
            RequirementCode: entity.RequirementCode,
            Title: entity.Title,
            Description: entity.Description,
            Required: entity.IsRequired,
            ActorType: entity.ActorType,
            AcceptedFileTypes: Deserialize<string[]>(entity.AcceptedFileTypesJson) ?? [],
            SortOrder: entity.SortOrder,
            IsActive: entity.IsActive);
    }

    private static RegulationAdminAllowedResidueDto ToAdminAllowedResidueDto(RegulationAllowedResidueCatalog entity)
    {
        return new RegulationAdminAllowedResidueDto(
            Id: entity.Id,
            LevelId: entity.Level,
            CategoryId: entity.CategoryId,
            CategoryTitle: entity.CategoryTitle,
            ResidueName: entity.ResidueName,
            QuantityMin: entity.QuantityMin,
            QuantityMax: entity.QuantityMax,
            Unit: entity.Unit,
            SortOrder: entity.SortOrder,
            IsActive: entity.IsActive);
    }

    private static RegulationAdminNormativeDto ToAdminNormativeDto(RegulationNormativeReferenceCatalog entity)
    {
        return new RegulationAdminNormativeDto(
            Id: entity.Id,
            LevelId: entity.Level,
            Code: entity.Code,
            Title: entity.Title,
            Article: entity.Article,
            ReferenceUrl: entity.ReferenceUrl,
            SortOrder: entity.SortOrder,
            IsActive: entity.IsActive);
    }

    private static void ValidateLevel(int levelId)
    {
        if (levelId < 1 || levelId > 4)
        {
            throw new InvalidOperationException("REGULATION_LEVEL_INVALID");
        }
    }

    private static string SafeCode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException("REGULATION_REQUIRED_FIELD_MISSING");
        }

        return value.Trim();
    }

    private static string SafeText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException("REGULATION_REQUIRED_FIELD_MISSING");
        }

        return value.Trim();
    }

    private static string NormalizeActorType(string? value)
    {
        var normalized = (value ?? "both").Trim().ToLowerInvariant();
        return normalized is "seller" or "buyer" or "both" ? normalized : "both";
    }

    private static T? Deserialize<T>(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<T>(json);
        }
        catch
        {
            return default;
        }
    }

    private static void ValidateEvidenceFile(RegulationUploadRequirementEvidenceCommand command)
    {
        if (command.Content is null || command.Content.Length == 0 || command.SizeBytes <= 0)
        {
            throw new InvalidOperationException("EVIDENCE_FILE_REQUIRED");
        }

        if (command.SizeBytes > MaxEvidenceFileSizeBytes)
        {
            throw new InvalidOperationException("EVIDENCE_FILE_TOO_LARGE");
        }

        var extension = Path.GetExtension(command.FileName);
        if (!AllowedEvidenceExtensions.Contains(extension))
        {
            throw new InvalidOperationException("EVIDENCE_FILE_EXTENSION_NOT_ALLOWED");
        }

        if (!AllowedEvidenceContentTypes.Contains(command.ContentType))
        {
            throw new InvalidOperationException("EVIDENCE_FILE_CONTENT_TYPE_NOT_ALLOWED");
        }
    }

    private static string ResolveFileKind(string contentType, string extension)
    {
        if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return "image";
        }

        if (string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase) || extension == ".pdf")
        {
            return "pdf";
        }

        return "document";
    }

    private string BuildPrivateObjectUrl(string bucket, string storagePath)
    {
        return $"{_supabaseOptions.Url.TrimEnd('/')}/storage/v1/object/{bucket}/{storagePath}";
    }

    private static string BuildSafeFileName(string originalFileName, string extension)
    {
        var baseName = Path.GetFileNameWithoutExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(baseName))
        {
            baseName = "evidence";
        }

        var safe = new string(baseName.Select(ch => char.IsLetterOrDigit(ch) ? char.ToLowerInvariant(ch) : '-').ToArray());
        while (safe.Contains("--", StringComparison.Ordinal))
        {
            safe = safe.Replace("--", "-");
        }

        safe = safe.Trim('-');
        if (string.IsNullOrWhiteSpace(safe))
        {
            safe = "evidence";
        }

        return $"{safe}{extension}";
    }

    private static string? ExtractFileName(string? pathOrUrl)
    {
        if (string.IsNullOrWhiteSpace(pathOrUrl))
        {
            return null;
        }

        var normalized = pathOrUrl;
        var queryIndex = normalized.IndexOf('?');
        if (queryIndex >= 0)
        {
            normalized = normalized[..queryIndex];
        }

        var slashIndex = normalized.LastIndexOf('/');
        return slashIndex >= 0 && slashIndex < normalized.Length - 1 ? normalized[(slashIndex + 1)..] : normalized;
    }

    private static string? InferFileKindFromPath(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return null;
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".jpg" or ".jpeg" or ".png" or ".webp" => "image",
            ".pdf" => "pdf",
            ".doc" or ".docx" => "document",
            _ => null
        };
    }

    private static bool TryParseStorageLocation(string url, out string bucket, out string storagePath)
    {
        bucket = string.Empty;
        storagePath = string.Empty;

        if (string.IsNullOrWhiteSpace(url))
        {
            return false;
        }

        var marker = "/storage/v1/object/";
        var index = url.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (index < 0)
        {
            return false;
        }

        var tail = url[(index + marker.Length)..];
        if (tail.StartsWith("public/", StringComparison.OrdinalIgnoreCase))
        {
            tail = tail["public/".Length..];
        }

        var queryIndex = tail.IndexOf('?');
        if (queryIndex >= 0)
        {
            tail = tail[..queryIndex];
        }

        var slash = tail.IndexOf('/');
        if (slash <= 0 || slash >= tail.Length - 1)
        {
            return false;
        }

        bucket = tail[..slash];
        storagePath = tail[(slash + 1)..];
        return true;
    }

    private static string ToLevelSlug(int level) => $"level{Math.Clamp(level, 0, 4)}";

    private static int ToLevelNumber(string levelSlug)
    {
        if (levelSlug.StartsWith("level", StringComparison.OrdinalIgnoreCase)
            && int.TryParse(levelSlug[5..], out var number))
        {
            return Math.Clamp(number, 0, 4);
        }

        return 0;
    }
}
