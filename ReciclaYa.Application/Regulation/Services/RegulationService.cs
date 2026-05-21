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
    IOptions<SupabaseOptions> supabaseOptions,
    IOptions<RegulationReviewOptions> regulationReviewOptions,
    ILogger<RegulationService> logger) : IRegulationService
{
    private const long MaxEvidenceFileSizeBytes = 10 * 1024 * 1024;

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

    private static readonly Dictionary<string, Dictionary<int, string[]>> RequiredRequirementCodesByActor = new(StringComparer.OrdinalIgnoreCase)
    {
        ["seller"] = new Dictionary<int, string[]>
        {
            [1] = ["l1-seller-dni-ruc"],
            [2] = ["l2-seller-ruc-volume", "l2-seller-classification"],
            [3] = ["l3-seller-origin"],
            [4] = ["l4-seller-classification"]
        },
        ["buyer"] = new Dictionary<int, string[]>
        {
            [1] = ["l1-buyer-license"],
            [3] = ["l3-buyer-eors"],
            [4] = ["l4-buyer-matpel"]
        }
    };

    private static readonly string[] Level4Keywords =
    [
        "peligroso", "quimic", "solvente", "hidrocarb", "aceite usado", "hospital",
        "biocontamin", "infect", "reactivo", "corrosivo", "toxico", "matpel"
    ];

    private static readonly string[] Level3Keywords =
    [
        "raee", "electron", "electrico", "bateria", "pila", "placa", "circuito", "monitor", "computadora", "cable"
    ];

    private static readonly string[] Level1Keywords =
    [
        "papel", "carton", "plastico", "vidrio", "metal", "aluminio", "pet", "hdpe", "lata"
    ];

    private readonly SupabaseOptions _supabaseOptions = supabaseOptions.Value;
    private readonly RegulationReviewOptions _regulationReviewOptions = regulationReviewOptions.Value;

    public async Task<RegulationMeDto> GetMeAsync(Guid userId, CancellationToken cancellationToken)
    {
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
        var requiredMinLevel = ClassifyRequiredLevel(request);
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
                Status = "uploaded",
                EvidenceUrl = evidenceUrl,
                Notes = $"Archivo cargado: {command.FileName}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            dbContext.UserRegulationRequirements.Add(current);
        }
        else
        {
            current.Status = "uploaded";
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
                    CurrentStatus = "pending",
                    UploadedFileName = null,
                    UploadedFileUrl = null,
                    UploadedFileKind = null,
                    Notes = "No se encontro evidencia registrada para este requisito."
                };
            }

            throw new InvalidOperationException("EVIDENCE_NOT_FOUND");
        }

        record.EvidenceUrl = null;
        record.Status = "pending";
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
        var targetStatus = (request.Status ?? string.Empty).Trim().ToLowerInvariant();
        if (targetStatus is not ("approved" or "rejected" or "in_review"))
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
            "in_review" => current is "uploaded" or "rejected",
            "approved" => current is "uploaded" or "in_review",
            "rejected" => current is "uploaded" or "in_review",
            _ => false
        };
        if (!isTransitionAllowed)
        {
            throw new InvalidOperationException("INVALID_REVIEW_TRANSITION");
        }

        if (targetStatus == "rejected" && string.IsNullOrWhiteSpace(request.Notes))
        {
            throw new InvalidOperationException("REJECT_REQUIRES_NOTES");
        }

        var normalizedNotes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        requirement.Status = targetStatus;
        requirement.Notes = normalizedNotes;
        requirement.ExpiresAt = targetStatus == "approved" ? request.ExpiresAt : null;
        requirement.UpdatedAt = DateTime.UtcNow;

        dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
        {
            Id = Guid.NewGuid(),
            UserId = requirement.UserId,
            Actor = $"admin:{adminUserId:D}",
            Action = "review_requirement",
            Allowed = targetStatus == "approved",
            RequiredMinLevel = requirement.Level,
            ActorCurrentLevel = requirement.Level,
              BlockingReasonCode = targetStatus switch
              {
                  "approved" => "REVIEW_APPROVED",
                  "rejected" => "REVIEW_REJECTED",
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

        await dbContext.SaveChangesAsync(cancellationToken);

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
        if (!RequiredRequirementCodesByActor.TryGetValue(actor, out var mapByLevel))
        {
            return [];
        }

        var requiredCodes = mapByLevel
            .Where(item => item.Key <= requiredLevel)
            .SelectMany(item => item.Value)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

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

    private static int ClassifyRequiredLevel(RegulationValidateOperationRequestDto request)
    {
        var pieces = new[] { request.ResidueType, request.Sector, request.ProductType, request.SpecificResidue };
        var normalized = string.Join(
                ' ',
                pieces.Where(item => !string.IsNullOrWhiteSpace(item)))
            .ToLowerInvariant();

        if (Level4Keywords.Any(keyword => normalized.Contains(keyword)))
        {
            return 4;
        }

        if (Level3Keywords.Any(keyword => normalized.Contains(keyword)))
        {
            return 3;
        }

        if (request.Sector is not null
            && (request.Sector.Contains("agri", StringComparison.OrdinalIgnoreCase)
                || request.Sector.Contains("food", StringComparison.OrdinalIgnoreCase)))
        {
            return 2;
        }

        if (Level1Keywords.Any(keyword => normalized.Contains(keyword)))
        {
            return 1;
        }

        return 2;
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
            Actor = actor,
            Action = request.Action,
            Allowed = result.Allowed,
            RequiredMinLevel = ToLevelNumber(result.RequiredMinLevel),
            ActorCurrentLevel = ToLevelNumber(result.ActorCurrentLevel),
            BlockingReasonCode = result.BlockingReasonCode,
            ContextResidueType = request.ResidueType,
            ContextSector = request.Sector,
            ContextProductType = request.ProductType,
            ContextSpecificResidue = request.SpecificResidue,
            ContextQuantity = request.Quantity,
            ContextUnit = request.Unit,
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
