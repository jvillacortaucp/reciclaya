using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;
using System.Text.Json;

namespace ReciclaYa.Application.Recommendations.Services;

public sealed class RecommendationService(
    IAuthDbContext dbContext,
    IRecommendationAiGenerator aiGenerator,
    ILogger<RecommendationService> logger) : IRecommendationService
{
    private const string ActiveStatus = "active";
    private const int MaxLimit = 10;
    private const int DefaultLimit = 5;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsAsync(
        Guid userId,
        bool isAdmin,
        int limit = DefaultLimit,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        var safeLimit = NormalizeLimit(limit);
        var preference = await GetCurrentPreferenceAsync(userId, cancellationToken);
        var candidates = await GetCandidateListingsAsync(userId, MaxLimit, cancellationToken);

        if (candidates.Count == 0)
        {
            return Array.Empty<RecommendationDto>();
        }

        if (useAi)
        {
            var context = BuildAiContext(
                userId,
                safeLimit,
                includeExplanation,
                preference,
                candidates.Select(ToCandidate).ToArray());
            var aiRecommendations = await aiGenerator.GenerateAsync(context, cancellationToken);
            if (aiRecommendations.Count > 0)
            {
                return aiRecommendations
                    .OrderByDescending(item => item.ConfidenceScore)
                    .ThenBy(item => item.Title)
                    .Take(safeLimit)
                    .ToArray();
            }
        }

        return Array.Empty<RecommendationDto>();
    }

    public async Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto?> GetListingAnalysisAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        string? selectedProductId = null,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .AsNoTracking()
            .Where(item => item.Id == listingId
                && item.Status == ListingStatus.Published
                && item.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (listing is null)
        {
            return null;
        }

        var candidate = ToCandidate(listing);

        // Try AI analysis if requested
        if (useAi)
        {
            try
            {
                var preference = await GetCurrentPreferenceAsync(userId, cancellationToken);
                var context = BuildAiContext(userId, 1, includeExplanation, preference, [candidate]);
                var aiAnalysis = await aiGenerator.AnalyzeListingProcessAsync(context, candidate, selectedProductId, cancellationToken);
                if (aiAnalysis is not null)
                {
                    var selected = ApplySelectedProduct(aiAnalysis, selectedProductId);
                    var geoCompleted = EnsureBuyerGeo(selected, listing.Location);
                    LogCoverage(listingId, geoCompleted);
                    await SaveAnalysisAsync(
                        userId,
                        "listing",
                        listingId,
                        selectedProductId,
                        null,
                        geoCompleted,
                        "ok",
                        null,
                        cancellationToken);
                    return geoCompleted;
                }
            }
            catch (Exception)
            {
                logger.LogWarning(
                    "Recommendation listing analysis failed. ListingId={ListingId}, Reason={Reason}",
                    listingId,
                    "ai-exception");
            }
        }

        var unavailable = BuildNoCreditsValueRoute(listing, selectedProductId);
        LogCoverage(listingId, unavailable);
        await SaveAnalysisAsync(
            userId,
            "listing",
            listingId,
            selectedProductId,
            null,
            unavailable,
            "unavailable",
            "sin-creditos",
            cancellationToken);
        return unavailable;
    }

    public async Task<RecommendationAnalysisRecordDto?> GetLatestListingAnalysisAsync(
        Guid listingId,
        string? selectedProductId = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedProductId = NormalizeSelectedProductId(selectedProductId);
        var query = dbContext.RecommendationAnalyses
            .AsNoTracking()
            .Where(item => item.AnalysisOrigin == "listing" && item.ListingId == listingId);

        query = normalizedProductId is null
            ? query.Where(item => item.SelectedProductId == null)
            : query.Where(item => item.SelectedProductId == normalizedProductId);

        var latest = await query
            .OrderByDescending(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return latest is null ? null : ToAnalysisRecordDto(latest);
    }

    public async Task<RecommendationAnalysisHistoryPageDto> GetListingAnalysisHistoryAsync(
        Guid listingId,
        string? selectedProductId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var normalizedProductId = NormalizeSelectedProductId(selectedProductId);

        var query = dbContext.RecommendationAnalyses
            .AsNoTracking()
            .Where(item => item.AnalysisOrigin == "listing" && item.ListingId == listingId);

        query = normalizedProductId is null
            ? query.Where(item => item.SelectedProductId == null)
            : query.Where(item => item.SelectedProductId == normalizedProductId);

        var total = await query.CountAsync(cancellationToken);
        var start = (safePage - 1) * safePageSize;
        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Skip(start)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);

        return new RecommendationAnalysisHistoryPageDto(
            items.Select(ToAnalysisRecordDto).ToArray(),
            total,
            safePage,
            safePageSize,
            start + safePageSize < total);
    }

    public async Task<ValueRouteDetailDto> GetChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        var analysis = await BuildChatbotAnalysisAsync(userId, request, useAi, includeExplanation, cancellationToken);
        await SaveAnalysisAsync(
            userId,
            "chatbot",
            null,
            request.ProductId,
            request,
            analysis.Detail,
            analysis.Status,
            analysis.ErrorCode,
            cancellationToken);

        return analysis.Detail;
    }

    public async Task<ValueRouteDetailDto> SaveChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        var analysis = await BuildChatbotAnalysisAsync(userId, request, useAi, includeExplanation, cancellationToken);
        await SaveAnalysisAsync(
            userId,
            "chatbot",
            null,
            request.ProductId,
            request,
            analysis.Detail,
            analysis.Status,
            analysis.ErrorCode,
            cancellationToken);

        return analysis.Detail;
    }

    public async Task<RecommendationAnalysisRecordDto?> GetLatestChatbotAnalysisAsync(
        Guid userId,
        string productId,
        CancellationToken cancellationToken = default)
    {
        var normalizedProductId = NormalizeSelectedProductId(productId);
        if (normalizedProductId is null)
        {
            return null;
        }

        var latest = await dbContext.RecommendationAnalyses
            .AsNoTracking()
            .Where(item =>
                item.UserId == userId
                && item.AnalysisOrigin == "chatbot"
                && item.ChatbotProductId == normalizedProductId)
            .OrderByDescending(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return latest is null ? null : ToAnalysisRecordDto(latest);
    }

    public async Task<RecommendationAnalysisHistoryPageDto> GetChatbotAnalysisHistoryAsync(
        Guid userId,
        string productId,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(1, page);
        var safePageSize = Math.Clamp(pageSize, 1, 50);
        var normalizedProductId = NormalizeSelectedProductId(productId);
        if (normalizedProductId is null)
        {
            return new RecommendationAnalysisHistoryPageDto(Array.Empty<RecommendationAnalysisRecordDto>(), 0, safePage, safePageSize, false);
        }

        var query = dbContext.RecommendationAnalyses
            .AsNoTracking()
            .Where(item =>
                item.UserId == userId
                && item.AnalysisOrigin == "chatbot"
                && item.ChatbotProductId == normalizedProductId);

        var total = await query.CountAsync(cancellationToken);
        var start = (safePage - 1) * safePageSize;
        var items = await query
            .OrderByDescending(item => item.CreatedAt)
            .Skip(start)
            .Take(safePageSize)
            .ToListAsync(cancellationToken);

        return new RecommendationAnalysisHistoryPageDto(
            items.Select(ToAnalysisRecordDto).ToArray(),
            total,
            safePage,
            safePageSize,
            start + safePageSize < total);
    }

    private async Task<(ValueRouteDetailDto Detail, string Status, string? ErrorCode)> BuildChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi,
        bool includeExplanation,
        CancellationToken cancellationToken)
    {
        var syntheticListing = BuildSyntheticListing(request);
        var candidate = ToCandidate(syntheticListing);

        if (useAi)
        {
            try
            {
                var preference = await GetCurrentPreferenceAsync(userId, cancellationToken);
                var context = BuildAiContext(userId, 1, includeExplanation, preference, [candidate]);
                var aiAnalysis = await aiGenerator.AnalyzeListingProcessAsync(context, candidate, request.ProductId, cancellationToken);
                if (aiAnalysis is not null)
                {
                    var selected = ApplySelectedProduct(aiAnalysis, request.ProductId);
                    var aligned = ApplyRequestedLevels(selected, request.Complexity, request.MarketPotential);
                    var geoCompleted = EnsureBuyerGeo(aligned, request.SectorName);
                    LogCoverage(syntheticListing.Id, geoCompleted);
                    return (geoCompleted, "ok", null);
                }
            }
            catch (Exception)
            {
                logger.LogWarning(
                    "Recommendation chatbot analysis failed. ProductId={ProductId}, Reason={Reason}",
                    request.ProductId,
                    "ai-exception");
            }
        }

        var unavailable = BuildNoCreditsValueRoute(syntheticListing, request.ProductId);
        LogCoverage(syntheticListing.Id, unavailable);
        return (unavailable, "unavailable", "sin-creditos");
    }

    private static ValueRouteDetailDto BuildNoCreditsValueRoute(
        Listing listing,
        string? selectedProductId)
    {
        var productName = ToProductNameFromSlug(selectedProductId)
            ?? (string.IsNullOrWhiteSpace(listing.ProductType) ? "No se pudo obtener" : listing.ProductType);
        var baseResidue = string.IsNullOrWhiteSpace(listing.SpecificResidue)
            ? "No se pudo obtener"
            : listing.SpecificResidue;
        const string unavailable = "No se pudo obtener por falta de creditos en IA.";

        return new ValueRouteDetailDto(
            $"rec-{listing.Id:N}",
            productName,
            baseResidue,
            "medium",
            unavailable,
            unavailable,
            "medium",
            Array.Empty<string>(),
            unavailable,
            unavailable,
            Array.Empty<ValueRouteExplanationStepDto>(),
            new ValueRouteEnvironmentalSummaryDto(0m, "No se pudo obtener", 0, "No se pudo obtener", 0, unavailable),
            new ValueRouteMarketAnalysisDto(
                new ValueRouteFinishedProductDto(productName, unavailable, unavailable, 0m, unavailable, string.Empty),
                Array.Empty<ValueRouteBuyerSegmentDto>(),
                Array.Empty<ValueRouteMarketKpiDto>(),
                Array.Empty<ValueRouteCostStructureItemDto>(),
                0m,
                0m,
                0m,
                new ValueRouteCompetitionInsightDto("No se pudo obtener", Array.Empty<string>(), unavailable),
                new ValueRouteOpportunitySummaryDto(
                    DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    unavailable,
                    unavailable,
                    unavailable,
                    "No se pudo obtener",
                    Array.Empty<string>(),
                    unavailable),
                Array.Empty<string>(),
                Array.Empty<decimal>()),
            Array.Empty<ValueRouteProcessStepDto>(),
            "sin-creditos",
            unavailable,
            null);
    }

    private static ValueRouteDetailDto ApplyRequestedLevels(
        ValueRouteDetailDto detail,
        string? requestedComplexity,
        string? requestedMarketPotential)
    {
        var complexity = NormalizeLevelOrNull(requestedComplexity);
        var marketPotential = NormalizeLevelOrNull(requestedMarketPotential);

        return detail with
        {
            Complexity = complexity ?? detail.Complexity,
            MarketPotential = marketPotential ?? detail.MarketPotential
        };
    }

    private static string? NormalizeLevelOrNull(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        return raw.Trim().ToLowerInvariant() switch
        {
            "high" or "alto" => "high",
            "medium" or "medio" => "medium",
            "low" or "bajo" => "low",
            _ => null
        };
    }

    private static ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto MapRecommendationDetailToValueRoute(
        RecommendationDetailDto detail,
        Domain.Entities.Listing listing)
    {
        // Map the minimal RecommendationDetailDto into the full ValueRouteDetailDto expected by frontend.
        var recommendedProduct = ((detail.PotentialProducts ?? Array.Empty<string>()).FirstOrDefault() ?? detail.ListingTitle) ?? string.Empty;
        var baseResidue = detail.ListingTitle;

        var processSteps = new List<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteProcessStepDto>
        {
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteProcessStepDto(
                "proc-1",
                1,
                "Validacion inicial",
                (detail.RequiredConditions ?? Array.Empty<string>()).FirstOrDefault() ?? "Verificar trazabilidad y condiciones.",
                "1 dia",
                new[] { "Ficha tecnica" },
                new[] { detail.SuggestedAction ?? "Contactar al seller" },
                "Solicitar muestras para evaluacion",
                detail.ViabilityLevel,
                "package-search"),
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteProcessStepDto(
                "proc-2",
                2,
                "Acondicionamiento y prueba",
                detail.RecommendedUse ?? "Acondicionar segun uso propuesto",
                "2-3 dias",
                new[] { "Equipo basico" },
                new[] { "Estandarizar lotes" },
                "Realiza pruebas en peque�a escala",
                "medium",
                "factory")
        };

        var explanationSteps = new List<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteExplanationStepDto>
        {
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteExplanationStepDto(
                "exp-1",
                1,
                "Resumen",
                "Justificacion",
                "Analisis IA",
                detail.AiExplanation ?? string.Empty,
                detail.BuyerBenefit ?? string.Empty,
                detail.RecommendedUse ?? "Resultado esperado del proceso de valorizaci�n.",
                detail.SuggestedAction ?? "Validar condiciones t�cnicas antes de escalar el proceso.",
                (detail.Risks ?? Array.Empty<string>()).FirstOrDefault() ?? "Validar riesgos",
                string.Empty,
                new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteEnvironmentalFactorsDto(new[] { "Aprovecha residuos" }, detail.Risks ?? Array.Empty<string>()),
                new[] { "Economia circular" },
                "scan-line")
        };

        var marketAnalysis = new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteMarketAnalysisDto(
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteFinishedProductDto(
                recommendedProduct,
                detail.RecommendedUse ?? "Uso sugerido",
                "Compra por lote",
                0m,
                detail.ViabilityLevel ?? "",
                string.Empty),
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteBuyerSegmentDto("buyer-1", "Segmento industrial", "B2B", "Segun disponibilidad", detail.ConfidenceScore, "Directo", "enterprise", "building") },
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteMarketKpiDto("kpi-1", "Confianza IA", $"{detail.ConfidenceScore}%", $"Fuente: {detail.Source}", detail.ConfidenceScore - 50, detail.ConfidenceScore >= 70 ? "emerald" : "amber") },
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteCostStructureItemDto("cost-1", "Materia prima", 0m, 50) },
            Math.Max(15, detail.ConfidenceScore - 20),
            0m,
            0m,
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteCompetitionInsightDto("Media", (detail.PotentialProducts ?? Array.Empty<string>()).Take(3).ToArray(), detail.SuggestedAction ?? string.Empty),
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteOpportunitySummaryDto(DateTime.UtcNow.ToString("yyyy-MM-dd"), "Validar segun cotizacion", "Depende", detail.BuyerBenefit ?? string.Empty, $"{Math.Max(40, detail.ConfidenceScore)}/100", new[] { detail.NextStep }, (detail.Risks ?? Array.Empty<string>()).FirstOrDefault() ?? string.Empty),
            new[] { "Confianza", "Viabilidad" },
            new decimal[] { detail.ConfidenceScore, detail.ViabilityLevel == "high" ? 85m : detail.ViabilityLevel == "low" ? 45m : 65m }
        );

        var envSummary = new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteEnvironmentalSummaryDto(
            detail.ConfidenceScore / 100m,
            detail.ViabilityLevel == "high" ? "Alto" : detail.ViabilityLevel == "low" ? "Bajo" : "Medio",
            detail.ConfidenceScore,
            detail.ViabilityLevel == "low" ? "Alto" : "Controlado",
            detail.ViabilityLevel == "low" ? 65 : 28,
            detail.NextStep);

        return new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto(
            $"rec-{listing.Id:N}",
            recommendedProduct,
            baseResidue,
            detail.ViabilityLevel ?? "medium",
            "48-72 horas para evaluacion comercial",
            "Costo aproximado seg�n escala y logistica",
            detail.ViabilityLevel ?? "medium",
            new[] { "Validacion tecnica", "Logistica" },
            detail.BuyerBenefit ?? string.Empty,
            detail.AiExplanation ?? string.Empty,
            explanationSteps,
            envSummary,
            marketAnalysis,
            processSteps,
            detail.Source ?? "deepseek");
    }

    private static ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto BuildFullFallbackValueRoute(
        PurchasePreference? preference,
        Domain.Entities.Listing listing,
        string? selectedProductId = null)
    {
        // Build a complete fallback ValueRouteDetailDto using DB data, ensuring no empty arrays for UI.
        var baseResidue = string.IsNullOrWhiteSpace(listing.SpecificResidue) ? (string.IsNullOrWhiteSpace(listing.ProductType) ? "residuo" : listing.ProductType) : listing.SpecificResidue;
        var preferredProduct = ToProductNameFromSlug(selectedProductId);
        var recommendedProduct = string.IsNullOrWhiteSpace(preferredProduct)
            ? $"Producto valorizado de {baseResidue}"
            : preferredProduct;

        var processSteps = new List<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteProcessStepDto>();
        for (var i = 1; i <= 4; i++)
        {
            processSteps.Add(new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteProcessStepDto(
                $"proc-{i}",
                i,
                i == 1 ? "Validacion inicial" : i == 2 ? "Acondicionamiento" : i == 3 ? "Transformacion piloto" : "Escalamiento",
                i == 1 ? "Verificar estado y trazabilidad" : i == 2 ? "Acondicionar y homogeneizar" : i == 3 ? "Probar proceso en pequena escala" : "Ajustar para produccion",
                i == 1 ? "1 dia" : i == 2 ? "2 dias" : i == 3 ? "3 dias" : "Variable",
                new[] { "Equipo basico" },
                new[] { "Accion clave 1", "Accion clave 2" },
                "Tip rapido",
                "medium",
                "factory"));
        }

        var explanationSteps = new List<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteExplanationStepDto>
        {
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteExplanationStepDto(
                "exp-1",
                1,
                "Justificacion comercial",
                "Justificacion",
                "Analisis practico",
                $"El residuo {baseResidue} puede aprovecharse como...",
                "Es relevante por demanda local.",
                "Resultado esperado",
                "Solicitar muestras",
                "Evitar riesgo X",
                string.Empty,
                new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteEnvironmentalFactorsDto(new[] { "Reduce merma" }, new[] { "Validar inocuidad" }),
                new[] { "Economia circular" },
                "scan-line")
        };

        var marketAnalysis = new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteMarketAnalysisDto(
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteFinishedProductDto(
                recommendedProduct,
                "Uso industrial",
                "Compra por lote",
                0m,
                "Potencial",
                string.Empty),
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteBuyerSegmentDto("buyer-1", "Segmento industrial", "B2B", "Segun disponibilidad", 60, "Directo", "enterprise", "building") },
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteMarketKpiDto("kpi-1", "Estimacion", "Media", "Fuente: fallback", 0, "slate") },
            new[] { new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteCostStructureItemDto("cost-1", "Materia prima", 0m, 50) },
            30m,
            0m,
            0m,
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteCompetitionInsightDto("Desconocido", new[] { "Sustituto 1" }, "Posicionamiento conservador"),
            new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteOpportunitySummaryDto(DateTime.UtcNow.ToString("yyyy-MM-dd"), "Validar segun cotizacion", "Depende", "Potencial inicial", "50/100", new[] { "Contactar seller" }, "Validar impacto"),
            new[] { "Confianza", "Viabilidad" },
            new decimal[] { 50m, 60m }
        );

        var envSummary = new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteEnvironmentalSummaryDto(0.5m, "Medio", 50, "Controlado", 28, "Validar trazabilidad");

        return new ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto(
            $"rec-{listing.Id:N}",
            recommendedProduct,
            baseResidue,
            "medium",
            "48-72 horas",
            "Costo aproximado segun escala",
            "medium",
            new[] { "Equipo basico" },
            "Resultado esperado",
            "Explicacion fallback",
            explanationSteps,
            envSummary,
            marketAnalysis,
            processSteps,
            "fallback",
            "Proceso de valorizacion basado en validacion, acondicionamiento, transformacion piloto y escalamiento.",
            new ValueRouteComplexityOverviewDto(
                "Requiere validacion tecnica del residuo.",
                "Equipo basico y control de calidad.",
                "Conocimiento operativo medio.",
                "48-72 horas para evaluacion inicial.",
                "Variable segun escala y logistica.",
                "Riesgo medio por variacion de calidad.",
                "Reduce merma y mejora circularidad."));
    }

    private static ValueRouteDetailDto ApplySelectedProduct(ValueRouteDetailDto detail, string? selectedProductId)
    {
        var selectedName = ToProductNameFromSlug(selectedProductId);
        if (string.IsNullOrWhiteSpace(selectedName))
        {
            return detail;
        }

        var marketAnalysis = detail.MarketAnalysis with
        {
            FinishedProduct = detail.MarketAnalysis.FinishedProduct with
            {
                Name = selectedName
            }
        };

        return detail with
        {
            RecommendedProduct = selectedName,
            MarketAnalysis = marketAnalysis
        };
    }

    private static string? ToProductNameFromSlug(string? selectedProductId)
    {
        if (string.IsNullOrWhiteSpace(selectedProductId))
        {
            return null;
        }

        var tokens = selectedProductId
            .Trim()
            .Split('-', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (tokens.Length == 0)
        {
            return null;
        }

        return string.Join(" ", tokens.Select(token => char.ToUpperInvariant(token[0]) + token[1..]));
    }

    private static ValueRouteDetailDto EnsureBuyerGeo(ValueRouteDetailDto detail, string? locationHint)
    {
        if (detail.MarketAnalysis.PotentialBuyers.Count == 0)
        {
            return detail;
        }

        var regionFallback = ResolveRegion(locationHint);
        var buyers = detail.MarketAnalysis.PotentialBuyers
            .Select(buyer => buyer with
            {
                Region = ResolveBuyerRegionFallback(buyer, regionFallback),
                Country = ResolveBuyerCountryFallback(buyer)
            })
            .ToArray();

        return detail with
        {
            MarketAnalysis = detail.MarketAnalysis with
            {
                PotentialBuyers = buyers
            }
        };
    }

    private static string ResolveRegion(string? locationHint)
    {
        if (string.IsNullOrWhiteSpace(locationHint))
        {
            return "No se encontró la información";
        }

        var first = locationHint
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault();

        return string.IsNullOrWhiteSpace(first) ? "No se encontró la información" : first;
    }

    private static string ResolveBuyerCountryFallback(ValueRouteBuyerSegmentDto buyer)
    {
        if (!string.IsNullOrWhiteSpace(buyer.Country))
        {
            return buyer.Country;
        }

        return IsInternationalBuyer(buyer) ? "No se encontró la información" : "Perú";
    }

    private static string ResolveBuyerRegionFallback(ValueRouteBuyerSegmentDto buyer, string regionFallback)
    {
        if (!string.IsNullOrWhiteSpace(buyer.Region))
        {
            return buyer.Region;
        }

        return IsInternationalBuyer(buyer)
            ? "Internacional"
            : regionFallback;
    }

    private static bool IsInternationalBuyer(ValueRouteBuyerSegmentDto buyer)
    {
        if (!string.IsNullOrWhiteSpace(buyer.Country)
            && !buyer.Country.Contains("peru", StringComparison.OrdinalIgnoreCase)
            && !buyer.Country.Contains("perú", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var text = $"{buyer.Name} {buyer.Segment} {buyer.Channel}";
        return text.Contains("internacional", StringComparison.OrdinalIgnoreCase)
            || text.Contains("export", StringComparison.OrdinalIgnoreCase);
    }

    private static ValueRouteDetailDto MergeWithFallback(ValueRouteDetailDto ai, ValueRouteDetailDto fallback)
    {
        var mergedMarket = ai.MarketAnalysis with
        {
            PotentialBuyers = ai.MarketAnalysis.PotentialBuyers.Count > 0
                ? ai.MarketAnalysis.PotentialBuyers
                : fallback.MarketAnalysis.PotentialBuyers,
            MarketKpis = ai.MarketAnalysis.MarketKpis.Count > 0
                ? ai.MarketAnalysis.MarketKpis
                : fallback.MarketAnalysis.MarketKpis,
            CostStructure = ai.MarketAnalysis.CostStructure.Count > 0
                ? ai.MarketAnalysis.CostStructure
                : fallback.MarketAnalysis.CostStructure,
            ChartLabels = ai.MarketAnalysis.ChartLabels.Count > 0
                ? ai.MarketAnalysis.ChartLabels
                : fallback.MarketAnalysis.ChartLabels,
            ChartSeries = ai.MarketAnalysis.ChartSeries.Count > 0
                ? ai.MarketAnalysis.ChartSeries
                : fallback.MarketAnalysis.ChartSeries
        };

        return ai with
        {
            RecommendationId = string.IsNullOrWhiteSpace(ai.RecommendationId) ? fallback.RecommendationId : ai.RecommendationId,
            RecommendedProduct = string.IsNullOrWhiteSpace(ai.RecommendedProduct) ? fallback.RecommendedProduct : ai.RecommendedProduct,
            BaseResidue = string.IsNullOrWhiteSpace(ai.BaseResidue) ? fallback.BaseResidue : ai.BaseResidue,
            TotalEstimatedTime = string.IsNullOrWhiteSpace(ai.TotalEstimatedTime) ? fallback.TotalEstimatedTime : ai.TotalEstimatedTime,
            ApproximateCost = string.IsNullOrWhiteSpace(ai.ApproximateCost) ? fallback.ApproximateCost : ai.ApproximateCost,
            PrincipalEquipment = ai.PrincipalEquipment.Count > 0 ? ai.PrincipalEquipment : fallback.PrincipalEquipment,
            ExpectedOutcome = string.IsNullOrWhiteSpace(ai.ExpectedOutcome) ? fallback.ExpectedOutcome : ai.ExpectedOutcome,
            Explanation = string.IsNullOrWhiteSpace(ai.Explanation) ? fallback.Explanation : ai.Explanation,
            ProcessSteps = ai.ProcessSteps.Count > 0 ? ai.ProcessSteps : fallback.ProcessSteps,
            ExplanationSteps = ai.ExplanationSteps.Count > 0 ? ai.ExplanationSteps : fallback.ExplanationSteps,
            MarketAnalysis = mergedMarket,
            Source = string.IsNullOrWhiteSpace(ai.Source) ? "fallback" : ai.Source,
            ManufacturingProcess = string.IsNullOrWhiteSpace(ai.ManufacturingProcess) ? fallback.ManufacturingProcess : ai.ManufacturingProcess,
            ComplexityOverview = ai.ComplexityOverview ?? fallback.ComplexityOverview
        };
    }

    private void LogCoverage(Guid listingId, ValueRouteDetailDto detail)
    {
        var processOk = detail.ProcessSteps.Count > 0;
        var explanationOk = detail.ExplanationSteps.Count > 0 && detail.ComplexityOverview is not null;
        var marketOk = detail.MarketAnalysis.PotentialBuyers.Count > 0
            && detail.MarketAnalysis.MarketKpis.Count > 0
            && detail.MarketAnalysis.CostStructure.Count > 0;

        var completed = 0;
        if (processOk) completed++;
        if (explanationOk) completed++;
        if (marketOk) completed++;
        var coverage = Math.Round((completed / 3m) * 100m, MidpointRounding.AwayFromZero);

        logger.LogInformation(
            "Recommendation analysis coverage. ListingId={ListingId}, Source={Source}, process_ok={ProcessOk}, explanation_ok={ExplanationOk}, market_ok={MarketOk}, coverage_percent={Coverage}",
            listingId,
            detail.Source ?? "fallback",
            processOk,
            explanationOk,
            marketOk,
            coverage);
    }

    private async Task SaveAnalysisAsync(
        Guid userId,
        string analysisOrigin,
        Guid? listingId,
        string? selectedProductId,
        ChatbotRecommendationAnalysisRequestDto? chatbotRequest,
        ValueRouteDetailDto detail,
        string status,
        string? errorCode,
        CancellationToken cancellationToken)
    {
        var (processOk, explanationOk, marketOk, coverage) = ComputeCoverage(detail);
        var normalizedProductId = NormalizeSelectedProductId(selectedProductId);
        var now = DateTime.UtcNow;
        var origin = string.IsNullOrWhiteSpace(analysisOrigin) ? "listing" : analysisOrigin.Trim().ToLowerInvariant();
        var chatbotProductId = origin == "chatbot"
            ? NormalizeSelectedProductId(chatbotRequest?.ProductId ?? selectedProductId)
            : null;

        dbContext.RecommendationAnalyses.Add(new RecommendationAnalysis
        {
            Id = Guid.NewGuid(),
            AnalysisOrigin = origin,
            UserId = userId,
            ListingId = listingId,
            SelectedProductId = normalizedProductId,
            ChatbotProductId = chatbotProductId,
            ChatbotProductName = origin == "chatbot" ? (chatbotRequest?.ProductName?.Trim()) : null,
            ChatbotResidueInput = origin == "chatbot" ? (chatbotRequest?.ResidueInput?.Trim()) : null,
            ChatbotSectorName = origin == "chatbot" ? (chatbotRequest?.SectorName?.Trim()) : null,
            Source = string.IsNullOrWhiteSpace(detail.Source) ? "unknown" : detail.Source.Trim().ToLowerInvariant(),
            Status = status,
            PayloadJson = JsonSerializer.Serialize(detail, JsonOptions),
            CoveragePercent = coverage,
            ProcessOk = processOk,
            ExplanationOk = explanationOk,
            MarketOk = marketOk,
            ErrorCode = errorCode,
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "analysis_saved. Origin={Origin}, ListingId={ListingId}, selectedProductId={SelectedProductId}, chatbotProductId={ChatbotProductId}, source={Source}, status={Status}, coverage_percent={Coverage}",
            origin,
            listingId?.ToString() ?? "null",
            normalizedProductId ?? "null",
            chatbotProductId ?? "null",
            string.IsNullOrWhiteSpace(detail.Source) ? "unknown" : detail.Source,
            status,
            coverage);
    }

    private static string? NormalizeSelectedProductId(string? selectedProductId)
    {
        if (string.IsNullOrWhiteSpace(selectedProductId))
        {
            return null;
        }

        return selectedProductId.Trim().ToLowerInvariant();
    }

    private static (bool ProcessOk, bool ExplanationOk, bool MarketOk, decimal CoveragePercent) ComputeCoverage(ValueRouteDetailDto detail)
    {
        var processOk = detail.ProcessSteps.Count > 0;
        var explanationOk = detail.ExplanationSteps.Count > 0 && detail.ComplexityOverview is not null;
        var marketOk = detail.MarketAnalysis.PotentialBuyers.Count > 0
            && detail.MarketAnalysis.MarketKpis.Count > 0
            && detail.MarketAnalysis.CostStructure.Count > 0;

        var completed = 0;
        if (processOk) completed++;
        if (explanationOk) completed++;
        if (marketOk) completed++;
        var coverage = Math.Round((completed / 3m) * 100m, 2, MidpointRounding.AwayFromZero);

        return (processOk, explanationOk, marketOk, coverage);
    }

    private static RecommendationAnalysisRecordDto ToAnalysisRecordDto(RecommendationAnalysis entity)
    {
        ValueRouteDetailDto? detail = null;
        if (!string.IsNullOrWhiteSpace(entity.PayloadJson))
        {
            try
            {
                detail = JsonSerializer.Deserialize<ValueRouteDetailDto>(entity.PayloadJson, JsonOptions);
            }
            catch (JsonException)
            {
                detail = null;
            }
        }

        detail ??= new ValueRouteDetailDto(
            entity.ListingId.HasValue ? $"rec-{entity.ListingId.Value:N}" : $"rec-chatbot-{entity.Id:N}",
            "No se pudo obtener",
            "No se pudo obtener",
            "medium",
            "No se pudo obtener",
            "No se pudo obtener",
            "medium",
            Array.Empty<string>(),
            "No se pudo obtener",
            "No se pudo obtener",
            Array.Empty<ValueRouteExplanationStepDto>(),
            new ValueRouteEnvironmentalSummaryDto(0m, "No se pudo obtener", 0, "No se pudo obtener", 0, "No se pudo obtener"),
            new ValueRouteMarketAnalysisDto(
                new ValueRouteFinishedProductDto("No se pudo obtener", "No se pudo obtener", "No se pudo obtener", 0m, "No se pudo obtener", string.Empty),
                Array.Empty<ValueRouteBuyerSegmentDto>(),
                Array.Empty<ValueRouteMarketKpiDto>(),
                Array.Empty<ValueRouteCostStructureItemDto>(),
                0m,
                0m,
                0m,
                new ValueRouteCompetitionInsightDto("No se pudo obtener", Array.Empty<string>(), "No se pudo obtener"),
                new ValueRouteOpportunitySummaryDto(DateTime.UtcNow.ToString("yyyy-MM-dd"), "No se pudo obtener", "No se pudo obtener", "No se pudo obtener", "No se pudo obtener", Array.Empty<string>(), "No se pudo obtener"),
                Array.Empty<string>(),
                Array.Empty<decimal>()),
            Array.Empty<ValueRouteProcessStepDto>(),
            entity.Source ?? "unknown");

        return new RecommendationAnalysisRecordDto(
            entity.Id,
            entity.ListingId,
            entity.SelectedProductId,
            entity.AnalysisOrigin,
            entity.UserId,
            entity.ChatbotProductId,
            entity.ChatbotProductName,
            entity.ChatbotResidueInput,
            entity.ChatbotSectorName,
            entity.Source ?? "unknown",
            entity.Status,
            entity.CoveragePercent,
            entity.ProcessOk,
            entity.ExplanationOk,
            entity.MarketOk,
            entity.ErrorCode,
            entity.CreatedAt,
            detail);
    }

    private async Task<PurchasePreference?> GetCurrentPreferenceAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await dbContext.PurchasePreferences
            .AsNoTracking()
            .Where(preference => preference.BuyerId == userId)
            .OrderByDescending(preference => preference.ProfileStatus == ActiveStatus)
            .ThenByDescending(preference => preference.UpdatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<Listing>> GetCandidateListingsAsync(
        Guid userId,
        int limit,
        CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Published
                && listing.DeletedAt == null
                && listing.SellerId != userId)
            .OrderByDescending(listing => listing.MatchScore ?? 0)
            .ThenByDescending(listing => listing.PublishedAt ?? listing.CreatedAt)
            .Take(Math.Clamp(limit, 1, MaxLimit))
            .ToListAsync(cancellationToken);
    }

    private static IReadOnlyCollection<RecommendationDto> BuildFallbackRecommendations(
        PurchasePreference? preference,
        IReadOnlyCollection<Listing> candidates,
        int limit)
    {
        return candidates
            .Select(listing => ToFallbackRecommendation(listing, preference))
            .OrderByDescending(recommendation => recommendation.ConfidenceScore)
            .ThenBy(recommendation => recommendation.Title)
            .Take(limit)
            .ToArray();
    }

    private static RecommendationDto ToFallbackRecommendation(
        Listing listing,
        PurchasePreference? preference)
    {
        var confidenceScore = Math.Clamp(ScoreCandidate(preference, listing), 0, 100);

        return new RecommendationDto(
            $"rec-{listing.Id:N}",
            listing.Id,
            BuildTitle(listing),
            BuildReason(confidenceScore, preference is not null),
            confidenceScore,
            "fallback",
            listing.WasteType,
            listing.Sector,
            listing.ProductType,
            listing.PricePerUnitUsd,
            listing.Location,
            BuildSuggestedAction(listing, confidenceScore),
            BuildBuyerBenefit(listing, confidenceScore),
            BuildRecommendedUse(listing),
            BuildPotentialProducts(listing),
            BuildRequiredConditions(listing, preference),
            BuildRisks(listing),
            BuildNextStep(listing),
            BuildViabilityLevel(confidenceScore));
    }

    private static int ScoreCandidate(PurchasePreference? preference, Listing listing)
    {
        var calculatedScore = preference is null
            ? CalculateGeneralScore(listing)
            : CalculatePreferenceScore(listing, preference);

        var finalScore = listing.MatchScore.HasValue
            ? (int)Math.Round((calculatedScore + listing.MatchScore.Value) / 2m, MidpointRounding.AwayFromZero)
            : calculatedScore;

        return Math.Clamp(finalScore, 0, 100);
    }

    private static int CalculatePreferenceScore(Listing listing, PurchasePreference preference)
    {
        var score = 0;

        score += Matches(listing.WasteType, preference.ResidueType) ? 22 : 0;
        score += Matches(listing.Sector, preference.Sector) ? 14 : 0;
        score += Matches(listing.ProductType, preference.ProductType) ? 12 : 0;
        score += Matches(listing.SpecificResidue, preference.SpecificResidue) ? 15 : 0;
        score += Matches(listing.Condition, preference.DesiredCondition) ? 8 : 0;
        score += Matches(listing.ExchangeType, preference.AcceptedExchangeType) ? 8 : 0;
        score += Matches(listing.DeliveryMode, preference.PreferredMode) ? 6 : 0;
        score += listing.ImmediateAvailability ? 5 : 0;
        score += LocationMatches(listing.Location, preference.ReceivingLocation) ? 6 : 0;
        score += PriceFits(listing.PricePerUnitUsd, preference.MinPriceUsd, preference.MaxPriceUsd) ? 8 : 0;
        score += VolumeCompatible(listing.Quantity, listing.Unit, preference.RequiredVolume, preference.Unit) ? 6 : 0;
        score += HasPriorityBoost(preference.Priority, listing.ImmediateAvailability) ? 4 : 0;
        score += HasPreferenceNotes(preference.Notes) && !string.IsNullOrWhiteSpace(listing.Description) ? 2 : 0;

        return Math.Clamp(score, 0, 100);
    }

    private static int CalculateGeneralScore(Listing listing)
    {
        var score = listing.MatchScore ?? 60;
        score += listing.ImmediateAvailability ? 8 : 0;
        score += listing.PricePerUnitUsd.HasValue ? 6 : 0;
        score += !string.IsNullOrWhiteSpace(listing.Description) ? 4 : 0;
        score += !string.IsNullOrWhiteSpace(listing.Restrictions) ? -4 : 0;

        return Math.Clamp(score, 0, 100);
    }

    private static Listing BuildSyntheticListing(ChatbotRecommendationAnalysisRequestDto request)
    {
        var now = DateTime.UtcNow;
        var residueInput = string.IsNullOrWhiteSpace(request.ResidueInput) ? "residuo" : request.ResidueInput.Trim();
        var productName = string.IsNullOrWhiteSpace(request.ProductName) ? residueInput : request.ProductName.Trim();

        return new Listing
        {
            Id = Guid.NewGuid(),
            ReferenceCode = $"chat-{now:yyyyMMddHHmmss}",
            WasteType = "organic",
            Sector = string.IsNullOrWhiteSpace(request.SectorName) ? "agroindustry" : request.SectorName.Trim().ToLowerInvariant(),
            ProductType = productName,
            SpecificResidue = residueInput,
            Description = string.IsNullOrWhiteSpace(request.Description) ? $"Idea de valorizacion para {productName}." : request.Description.Trim(),
            Quantity = 1,
            Unit = "tons",
            Currency = "PEN",
            ExchangeType = "sale",
            DeliveryMode = "coordinated_delivery",
            ImmediateAvailability = true,
            Condition = "dry",
            Location = "Lima",
            Status = ListingStatus.Published,
            CreatedAt = now,
            UpdatedAt = now,
            PublishedAt = now
        };
    }

    private static RecommendationAiContext BuildAiContext(
        Guid buyerId,
        int limit,
        bool includeExplanation,
        PurchasePreference? preference,
        IReadOnlyCollection<RecommendationCandidateDto> candidates)
    {
        return new RecommendationAiContext(
            buyerId,
            NormalizeLimit(limit),
            includeExplanation,
            ToPreferenceDto(preference),
            candidates);
    }

    private static RecommendationPreferenceDto? ToPreferenceDto(PurchasePreference? preference)
    {
        if (preference is null)
        {
            return null;
        }

        return new RecommendationPreferenceDto(
            preference.ResidueType,
            preference.Sector,
            preference.ProductType,
            preference.SpecificResidue,
            preference.RequiredVolume,
            preference.Unit,
            preference.MinPriceUsd,
            preference.MaxPriceUsd,
            preference.DesiredCondition,
            preference.ReceivingLocation,
            preference.RadiusKm,
            preference.AcceptedExchangeType,
            preference.PreferredMode,
            preference.Notes,
            preference.Priority);
    }

    private static RecommendationCandidateDto ToCandidate(Listing listing)
    {
        return new RecommendationCandidateDto(
            listing.Id,
            BuildTitle(listing),
            listing.WasteType,
            listing.Sector,
            listing.ProductType,
            listing.SpecificResidue,
            listing.Description,
            listing.Quantity,
            listing.Unit,
            listing.PricePerUnitUsd,
            listing.Condition,
            listing.Location,
            listing.ExchangeType,
            listing.DeliveryMode,
            listing.ImmediateAvailability,
            listing.MatchScore);
    }

    private static RecommendationDetailDto BuildFallbackDetail(PurchasePreference? preference, Listing listing)
    {
        var score = Math.Clamp(ScoreCandidate(preference, listing), 0, 100);
        var requiredConditions = BuildRequiredConditions(listing, preference);
        var risks = BuildRisks(listing);

        return new RecommendationDetailDto(
            listing.Id,
            BuildTitle(listing),
            BuildReason(score, preference is not null),
            BuildRecommendedUse(listing),
            BuildBuyerBenefit(listing, score),
            BuildSuggestedAction(listing, score),
            BuildPotentialProducts(listing),
            requiredConditions,
            risks,
            BuildNextStep(listing),
            score,
            BuildViabilityLevel(score),
            "fallback");
    }

    private static string BuildTitle(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.SpecificResidue))
        {
            return listing.SpecificResidue.Trim();
        }

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return listing.ProductType.Trim();
        }

        return $"Listing {listing.ReferenceCode}";
    }

    private static string BuildReason(int confidenceScore, bool hasPreference)
    {
        if (hasPreference && confidenceScore >= 90)
        {
            return "Alta coincidencia con tus preferencias de compra.";
        }

        if (confidenceScore >= 70)
        {
            return hasPreference
                ? "Buena oportunidad segun tu perfil de busqueda."
                : "Buena oportunidad disponible en el marketplace.";
        }

        return "Oportunidad disponible en el marketplace.";
    }

    private static string BuildSuggestedAction(Listing listing, int confidenceScore)
    {
        if (confidenceScore >= 80)
        {
            return "Contacta al seller y solicita una pre-orden para asegurar volumen.";
        }

        if (listing.ImmediateAvailability)
        {
            return "Solicita una muestra o validacion tecnica antes de cerrar compra.";
        }

        return "Coordina disponibilidad y condiciones logisticas antes de negociar.";
    }

    private static string BuildBuyerBenefit(Listing listing, int confidenceScore)
    {
        if (listing.PricePerUnitUsd.HasValue)
        {
            return $"Puede mejorar tu abastecimiento con precio referencial de S/ {listing.PricePerUnitUsd.Value:0.##} por {listing.Unit}.";
        }

        return confidenceScore >= 75
            ? "Alineado con tu perfil comercial y operativo."
            : "Puede ser una alternativa util para ampliar fuentes de suministro.";
    }

    private static string BuildRecommendedUse(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return $"Usar como insumo para procesos de {listing.ProductType.Trim().ToLowerInvariant()}.";
        }

        return "Usar como insumo industrial con validacion tecnica previa.";
    }

    private static IReadOnlyCollection<string> BuildPotentialProducts(Listing listing)
    {
        var items = new List<string>();

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            items.Add($"{listing.ProductType.Trim()} valorizado");
        }

        if (!string.IsNullOrWhiteSpace(listing.WasteType))
        {
            items.Add($"Subproducto de {listing.WasteType.Trim().ToLowerInvariant()}");
        }

        if (items.Count == 0)
        {
            items.Add("Subproducto circular");
        }

        return items.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }

    private static IReadOnlyCollection<string> BuildRequiredConditions(Listing listing, PurchasePreference? preference)
    {
        var conditions = new List<string>();

        if (!string.IsNullOrWhiteSpace(listing.Condition))
        {
            conditions.Add($"Verificar estado del material: {listing.Condition.Trim()}.");
        }

        if (!string.IsNullOrWhiteSpace(listing.DeliveryMode))
        {
            conditions.Add($"Confirmar modalidad logistica: {listing.DeliveryMode.Trim()}.");
        }

        if (!string.IsNullOrWhiteSpace(preference?.ReceivingLocation))
        {
            conditions.Add($"Validar entrega hacia {preference.ReceivingLocation.Trim()}.");
        }

        if (!string.IsNullOrWhiteSpace(listing.Restrictions))
        {
            conditions.Add($"Revisar restricciones declaradas por seller: {listing.Restrictions.Trim()}.");
        }

        if (conditions.Count == 0)
        {
            conditions.Add("Validar trazabilidad y condiciones de almacenamiento.");
        }

        return conditions;
    }

    private static IReadOnlyCollection<string> BuildRisks(Listing listing)
    {
        var risks = new List<string>();

        if (!listing.ImmediateAvailability && listing.NextAvailabilityDate.HasValue)
        {
            risks.Add($"Disponibilidad futura estimada para {listing.NextAvailabilityDate.Value:yyyy-MM-dd}.");
        }

        if (!string.IsNullOrWhiteSpace(listing.Restrictions))
        {
            risks.Add("Aplican restricciones operativas o regulatorias del seller.");
        }

        if (string.Equals(listing.WasteType, "organic", StringComparison.OrdinalIgnoreCase)
            || string.Equals(listing.WasteType, "food", StringComparison.OrdinalIgnoreCase))
        {
            risks.Add("Si el uso es alimentario o animal, requiere validacion sanitaria previa.");
        }

        if (risks.Count == 0)
        {
            risks.Add("Validar compatibilidad tecnica antes de cerrar compra.");
        }

        return risks;
    }

    private static string BuildNextStep(Listing listing)
    {
        return listing.ImmediateAvailability
            ? "Inicia solicitud comercial y acuerda condiciones de entrega."
            : "Solicita cronograma de disponibilidad y confirma condiciones.";
    }

    private static string BuildViabilityLevel(int confidenceScore)
    {
        return confidenceScore switch
        {
            >= 80 => "high",
            >= 55 => "medium",
            _ => "low"
        };
    }

    private static bool Matches(string? left, string? right)
    {
        return !string.IsNullOrWhiteSpace(left)
            && !string.IsNullOrWhiteSpace(right)
            && string.Equals(left.Trim(), right.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    private static bool LocationMatches(string? listingLocation, string? receivingLocation)
    {
        if (string.IsNullOrWhiteSpace(listingLocation) || string.IsNullOrWhiteSpace(receivingLocation))
        {
            return false;
        }

        return listingLocation.Contains(receivingLocation, StringComparison.OrdinalIgnoreCase)
            || receivingLocation.Contains(listingLocation, StringComparison.OrdinalIgnoreCase);
    }

    private static bool PriceFits(decimal? listingPrice, decimal? minPrice, decimal? maxPrice)
    {
        if (!listingPrice.HasValue)
        {
            return false;
        }

        if (minPrice.HasValue && listingPrice.Value < minPrice.Value)
        {
            return false;
        }

        if (maxPrice.HasValue && listingPrice.Value > maxPrice.Value)
        {
            return false;
        }

        return true;
    }

    private static bool VolumeCompatible(
        decimal listingQuantity,
        string listingUnit,
        decimal requiredVolume,
        string? preferenceUnit)
    {
        if (requiredVolume <= 0 || string.IsNullOrWhiteSpace(preferenceUnit))
        {
            return false;
        }

        if (!Matches(listingUnit, preferenceUnit))
        {
            return false;
        }

        return listingQuantity >= requiredVolume * 0.5m;
    }

    private static bool HasPriorityBoost(string? priority, bool immediateAvailability)
    {
        return immediateAvailability
            && string.Equals(priority, "high", StringComparison.OrdinalIgnoreCase);
    }

    private static bool HasPreferenceNotes(string? notes)
    {
        return !string.IsNullOrWhiteSpace(notes);
    }

    private static int NormalizeLimit(int limit)
    {
        return Math.Clamp(limit <= 0 ? DefaultLimit : limit, 1, MaxLimit);
    }
}
