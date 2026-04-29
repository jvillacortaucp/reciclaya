using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Application.Recommendations.Services;
using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Infrastructure.Options;

namespace ReciclaYa.Infrastructure.AI;

public sealed class DeepSeekRecommendationGenerator(
    HttpClient httpClient,
    IOptions<DeepSeekOptions> options,
    ILogger<DeepSeekRecommendationGenerator> logger) : IRecommendationAiGenerator
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly HashSet<string> AllowedViabilityLevels =
    [
        "low",
        "medium",
        "high"
    ];

    public async Task<IReadOnlyCollection<RecommendationDto>> GenerateAsync(
        RecommendationAiContext context,
        CancellationToken cancellationToken = default)
    {
        if (!HasApiKeyConfigured(out var apiKey))
        {
            return Array.Empty<RecommendationDto>();
        }

        try
        {
            var content = await RequestCompletionAsync(apiKey, BuildPrompt(context), cancellationToken);
            var parsed = ParseRecommendations(content, context.Candidates, context.Limit);
            if (parsed.Count != context.Limit)
            {
                return Array.Empty<RecommendationDto>();
            }

            return parsed;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "DeepSeek recommendation generation failed.");
            return Array.Empty<RecommendationDto>();
        }
    }

    public async Task<RecommendationDetailDto?> AnalyzeListingAsync(
        RecommendationAiContext context,
        RecommendationCandidateDto candidate,
        CancellationToken cancellationToken = default)
    {
        var singleContext = context with
        {
            Limit = 1,
            Candidates = [candidate]
        };

        var recommendations = await GenerateAsync(singleContext, cancellationToken);
        var item = recommendations.FirstOrDefault();
        if (item is null)
        {
            return null;
        }

        return new RecommendationDetailDto(
            item.ListingId,
            item.Title,
            item.Reason,
            item.RecommendedUse ?? "Uso potencial segun analisis IA.",
            item.BuyerBenefit ?? "Beneficio comercial segun analisis IA.",
            item.SuggestedAction ?? "Solicitar mayor informacion tecnica al seller.",
            item.PotentialProducts ?? Array.Empty<string>(),
            item.RequiredConditions ?? Array.Empty<string>(),
            item.Risks ?? Array.Empty<string>(),
            item.NextStep ?? "Coordinar una solicitud comercial inicial.",
            item.ConfidenceScore,
            NormalizeViabilityLevel(item.ViabilityLevel),
            "deepseek");
    }

    public async Task<ValueRouteDetailDto?> AnalyzeListingProcessAsync(
        RecommendationAiContext context,
        RecommendationCandidateDto candidate,
        CancellationToken cancellationToken = default)
    {
        if (!HasApiKeyConfigured(out var apiKey))
        {
            logger.LogWarning("DeepSeek listing analysis skipped: API key not configured.");
            return null;
        }

        try
        {
            var prompt = BuildProcessPrompt(context, candidate);
            var content = await RequestCompletionAsync(apiKey, prompt, cancellationToken);
            if (string.IsNullOrWhiteSpace(content))
            {
                logger.LogWarning("DeepSeek listing analysis empty response. ListingId={ListingId}", candidate.ListingId);
                return null;
            }

            var parsed = ParseProcess(content, candidate);
            if (parsed is null)
            {
                logger.LogWarning("DeepSeek listing analysis json-invalid. ListingId={ListingId}", candidate.ListingId);
                return null;
            }

            var processOk = parsed.ProcessSteps.Count > 0;
            var explanationOk = parsed.ExplanationSteps.Count > 0;
            var marketOk = parsed.MarketAnalysis.PotentialBuyers.Count > 0
                && parsed.MarketAnalysis.MarketKpis.Count > 0
                && parsed.MarketAnalysis.CostStructure.Count > 0;
            if (!processOk || !explanationOk || !marketOk)
            {
                logger.LogWarning(
                    "DeepSeek listing analysis schema-partial. ListingId={ListingId}, process_ok={ProcessOk}, explanation_ok={ExplanationOk}, market_ok={MarketOk}",
                    candidate.ListingId,
                    processOk,
                    explanationOk,
                    marketOk);
            }

            return parsed with { Source = "deepseek" };
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(exception, "DeepSeek listing process analysis timeout. ListingId={ListingId}", candidate.ListingId);
            return null;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "DeepSeek listing process analysis failed. ListingId={ListingId}", candidate.ListingId);
            return null;
        }
    }

    private async Task<string> RequestCompletionAsync(
        string apiKey,
        string prompt,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        // Do not log API key or its length. Log only that API key is configured.
        logger.LogInformation(
            "DeepSeek recommendations request. BaseUrl={BaseUrl}, Model={Model}, ApiKeyConfigured={ApiKeyConfigured}",
            settings.BaseUrl,
            settings.Model,
            !string.IsNullOrWhiteSpace(apiKey));

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new DeepSeekChatRequest(
                    settings.Model,
                    [
                        new DeepSeekMessage(
                            "system",
                            "Eres un asesor comercial experto en economia circular y compra industrial de residuos para MIPYMES peruanas. Debes recomendar oportunidades reales, seguras y accionables."),
                        new DeepSeekMessage("user", prompt)
                    ]), JsonOptions),
                Encoding.UTF8,
                "application/json")
        };

        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                logger.LogWarning("DeepSeek recommendations unauthorized (401).");
                return string.Empty;
            }

            if ((int)response.StatusCode == 402)
            {
                logger.LogWarning("DeepSeek recommendations insufficient balance (402).");
                return string.Empty;
            }

            if (response.StatusCode == (HttpStatusCode)429)
            {
                logger.LogWarning("DeepSeek recommendations rate limit (429).");
                return string.Empty;
            }

            logger.LogWarning(
                "DeepSeek recommendations failed with status code {StatusCode}.",
                (int)response.StatusCode);
            return string.Empty;
        }

        var parsed = JsonSerializer.Deserialize<DeepSeekChatResponse>(rawContent, JsonOptions);
        return parsed?.Choices?.FirstOrDefault()?.Message?.Content ?? string.Empty;
    }

    private static IReadOnlyCollection<RecommendationDto> ParseRecommendations(
        string content,
        IReadOnlyCollection<RecommendationCandidateDto> candidates,
        int limit)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return Array.Empty<RecommendationDto>();
        }

        var json = TryExtractJson(content);
        if (string.IsNullOrWhiteSpace(json))
        {
            return Array.Empty<RecommendationDto>();
        }

        try
        {
            var envelope = JsonSerializer.Deserialize<RecommendationsEnvelope>(json, JsonOptions);
            if (envelope?.Recommendations is null || envelope.Recommendations.Count != limit)
            {
                return Array.Empty<RecommendationDto>();
            }

            var candidatesById = candidates.ToDictionary(item => item.ListingId, item => item);
            var parsed = new List<RecommendationDto>();
            foreach (var payload in envelope.Recommendations)
            {
                if (!Guid.TryParse(payload.ListingId, out var listingId))
                {
                    continue;
                }

                if (!candidatesById.TryGetValue(listingId, out var candidate))
                {
                    continue;
                }

                var confidenceScore = NormalizeScore(payload.ConfidenceScore);
                parsed.Add(new RecommendationDto(
                    $"rec-{listingId:N}",
                    listingId,
                    CleanText(payload.Title, candidate.Title),
                    CleanText(payload.Reason, "Coincidencia comercial sugerida por IA."),
                    confidenceScore,
                    "deepseek",
                    candidate.WasteType,
                    candidate.Sector,
                    candidate.ProductType,
                    candidate.PricePerUnitUsd,
                    candidate.Location,
                    CleanText(payload.SuggestedAction, "Contacta al seller para validar condiciones."),
                    CleanText(payload.BuyerBenefit, "Puede mejorar tu abastecimiento."),
                    CleanText(payload.RecommendedUse, "Uso sugerido para valorizacion comercial."),
                    NormalizeCollection(payload.PotentialProducts),
                    NormalizeCollection(payload.RequiredConditions),
                    NormalizeCollection(payload.Risks),
                    CleanText(payload.NextStep, "Solicitar validacion tecnica inicial."),
                    NormalizeViabilityLevel(payload.ViabilityLevel)));
            }

            return parsed.Count == limit
                ? parsed
                : Array.Empty<RecommendationDto>();
        }
        catch (JsonException)
        {
            return Array.Empty<RecommendationDto>();
        }
    }

    private bool HasApiKeyConfigured(out string apiKey)
    {
        apiKey = options.Value.ApiKey?.Trim() ?? string.Empty;
        return !string.IsNullOrWhiteSpace(apiKey);
    }

    private static int NormalizeScore(int? value)
    {
        if (!value.HasValue)
        {
            return 50;
        }

        return Math.Clamp(value.Value, 0, 100);
    }

    private static string NormalizeViabilityLevel(string? value)
    {
        var normalized = value?.Trim().ToLowerInvariant() ?? string.Empty;
        return AllowedViabilityLevels.Contains(normalized) ? normalized : "medium";
    }

    private static IReadOnlyCollection<string> NormalizeCollection(IReadOnlyCollection<string>? values)
    {
        return values?
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
            ?? Array.Empty<string>();
    }

    private static string CleanText(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }

    private static string BuildPrompt(RecommendationAiContext context)
    {
        var preferenceJson = JsonSerializer.Serialize(context.Preference, JsonOptions);
        var candidatesJson = JsonSerializer.Serialize(context.Candidates, JsonOptions);

        return $@"Genera exactamente {context.Limit} recomendaciones para este buyer usando SOLO los candidate listings entregados.

Buyer preference:
{preferenceJson}

Candidate listings:
{candidatesJson}

Devuelve SOLO JSON valido, sin markdown, con esta forma:
{{
  ""recommendations"": [
    {{
      ""listingId"": ""guid"",
      ""title"": ""string"",
      ""reason"": ""string"",
      ""confidenceScore"": 0,
      ""recommendedUse"": ""string"",
      ""buyerBenefit"": ""string"",
      ""suggestedAction"": ""string"",
      ""potentialProducts"": [""string""],
      ""requiredConditions"": [""string""],
      ""risks"": [""string""],
      ""nextStep"": ""string"",
      ""viabilityLevel"": ""low|medium|high""
    }}
  ]
}}

Reglas:
- Devuelve exactamente {context.Limit} recomendaciones.
- Solo usa listingIds presentes en candidate listings.
- No inventes listingIds, empresas, certificaciones ni precios.
- No sugieras usos peligrosos.
- Si el uso puede ser alimentario o animal, agrega advertencia sanitaria.
- Usa lenguaje comercial claro para MIPYMES peruanas.
- confidenceScore debe ser entero de 0 a 100.
- Prioriza compatibilidad comercial, operativa, logistica y precio.
- Si un listing tiene poca viabilidad, no lo recomiendes salvo que no haya mejores opciones.";
    }

    private static string BuildProcessPrompt(RecommendationAiContext context, RecommendationCandidateDto candidate)
    {
        var preferenceJson = JsonSerializer.Serialize(context.Preference, JsonOptions);
        var candidateJson = JsonSerializer.Serialize(candidate, JsonOptions);

        return $@"Genera un analisis completo tab-driven para recomendaciones industriales basado en ESTE listing.

Buyer preference:
{preferenceJson}

Listing:
{candidateJson}

Devuelve SOLO JSON valido con esta forma exacta:
{{
  ""recommendationId"": ""rec-<listingId>"",
  ""recommendedProduct"": ""string"",
  ""baseResidue"": ""string"",
  ""complexity"": ""low|medium|high"",
  ""totalEstimatedTime"": ""string"",
  ""approximateCost"": ""string"",
  ""marketPotential"": ""low|medium|high"",
  ""principalEquipment"": [""string""],
  ""expectedOutcome"": ""string"",
  ""explanation"": ""string"",
  ""manufacturingProcess"": ""string"",
  ""complexityOverview"": {{
    ""processingRequired"": ""string"",
    ""equipmentNeeded"": ""string"",
    ""technicalKnowledge"": ""string"",
    ""transformationTime"": ""string"",
    ""estimatedCost"": ""string"",
    ""operationalRisk"": ""string"",
    ""positiveEnvironmentalImpact"": ""string""
  }},
  ""processSteps"": [
    {{
      ""id"": ""string"",
      ""order"": 1,
      ""title"": ""string"",
      ""shortDescription"": ""string"",
      ""estimatedTime"": ""string"",
      ""requiredEquipment"": [""string""],
      ""keyActions"": [""string""],
      ""quickTip"": ""string"",
      ""riskLevel"": ""low|medium|high"",
      ""iconName"": ""package-search|droplets|wind|factory|scan-line|package|archive""
    }}
  ],
  ""explanationSteps"": [
    {{
      ""id"": ""string"",
      ""order"": 1,
      ""title"": ""string"",
      ""shortLabel"": ""string"",
      ""transformationType"": ""string"",
      ""whatHappens"": ""string"",
      ""whyItMatters"": ""string"",
      ""transformationOutcome"": ""string"",
      ""quickTip"": ""string"",
      ""avoidRisk"": ""string"",
      ""processImageUrl"": ""string"",
      ""environmentalFactors"": {{
        ""positive"": [""string""],
        ""negative"": [""string""]
      }},
      ""natureBenefits"": [""string""],
      ""iconName"": ""package-search|droplets|wind|factory|scan-line|package|archive""
    }}
  ],
  ""environmentalSummary"": {{
    ""impactScore"": 0.0,
    ""utilizationLevelLabel"": ""string"",
    ""utilizationPercent"": 0,
    ""environmentalRiskLabel"": ""string"",
    ""environmentalRiskPercent"": 0,
    ""keyRecommendation"": ""string""
  }},
  ""marketAnalysis"": {{
    ""finishedProduct"": {{
      ""name"": ""string"",
      ""useCase"": ""string"",
      ""suggestedFormat"": ""string"",
      ""suggestedPricePerKg"": 0.0,
      ""opportunityTag"": ""string"",
      ""productImageUrl"": ""string""
    }},
    ""potentialBuyers"": [
      {{
        ""id"": ""string"",
        ""name"": ""string"",
        ""segment"": ""string"",
        ""monthlyVolume"": ""string"",
        ""probability"": 0,
        ""channel"": ""string"",
        ""type"": ""enterprise|retail|consumer"",
        ""iconName"": ""building|store|leaf""
      }}
    ],
    ""marketKpis"": [
      {{
        ""id"": ""string"",
        ""label"": ""string"",
        ""value"": ""string"",
        ""helper"": ""string"",
        ""trendPercent"": 0,
        ""tone"": ""emerald|slate|amber""
      }}
    ],
    ""costStructure"": [
      {{
        ""id"": ""string"",
        ""label"": ""string"",
        ""amountUsd"": 0.0,
        ""percent"": 0
      }}
    ],
    ""estimatedGrossMarginPercent"": 0.0,
    ""suggestedPricePerKg"": 0.0,
    ""totalCostPerKg"": 0.0,
    ""competitionInsight"": {{
      ""competitionLevelLabel"": ""string"",
      ""directSubstitutes"": [""string""],
      ""positioningRecommendation"": ""string""
    }},
    ""opportunitySummary"": {{
      ""generatedAt"": ""string"",
      ""initialInvestment"": ""string"",
      ""paybackPeriod"": ""string"",
      ""monthlyProfitability"": ""string"",
      ""sustainabilityScore"": ""string"",
      ""nextSteps"": [""string""],
      ""ecoTip"": ""string""
    }},
    ""chartLabels"": [""string""],
    ""chartSeries"": [0.0]
  }}
}}

Reglas:
- No markdown.
- Completa todos los bloques (proceso, complejidad, mercado).
- riskLevel/complexity/marketPotential solo low|medium|high.
- utilizationPercent/environmentalRiskPercent/probability/trendPercent/percent en rango 0..100.
- Incluye al menos 3 processSteps y 2 explanationSteps.
- Incluye al menos 1 buyer, 1 KPI y 2 items de costo.
- Si uso alimentario/animal, agregar advertencia sanitaria en riesgos o condiciones.";
    }

    private static string? TryExtractJson(string content)
    {
        var start = content.IndexOf('{');
        if (start < 0)
        {
            return null;
        }

        var depth = 0;
        var insideString = false;
        var escaping = false;

        for (var index = start; index < content.Length; index++)
        {
            var character = content[index];

            if (insideString)
            {
                if (escaping)
                {
                    escaping = false;
                    continue;
                }

                if (character == '\\')
                {
                    escaping = true;
                    continue;
                }

                if (character == '"')
                {
                    insideString = false;
                }

                continue;
            }

            if (character == '"')
            {
                insideString = true;
                continue;
            }

            if (character == '{')
            {
                depth++;
            }
            else if (character == '}')
            {
                depth--;
                if (depth == 0)
                {
                    return content[start..(index + 1)];
                }
            }
        }

        return null;
    }

    private sealed record DeepSeekChatRequest(string Model, IReadOnlyCollection<DeepSeekMessage> Messages);

    private sealed record DeepSeekMessage(string Role, string Content);

    private sealed record DeepSeekChatResponse(IReadOnlyCollection<DeepSeekChoice>? Choices);

    private sealed record DeepSeekChoice(DeepSeekMessageResponse? Message);

    private sealed record DeepSeekMessageResponse(string? Content);

    private sealed record RecommendationsEnvelope(IReadOnlyCollection<RecommendationPayload>? Recommendations);

    private sealed record RecommendationPayload(
        string? ListingId,
        string? Title,
        string? Reason,
        int? ConfidenceScore,
        string? RecommendedUse,
        string? BuyerBenefit,
        string? SuggestedAction,
        IReadOnlyCollection<string>? PotentialProducts,
        IReadOnlyCollection<string>? RequiredConditions,
        IReadOnlyCollection<string>? Risks,
        string? NextStep,
        string? ViabilityLevel);

    private static ValueRouteDetailDto? ParseProcess(string content, RecommendationCandidateDto candidate)
    {
        var json = TryExtractJson(content);
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;

            var recommendationId = ReadString(root, "recommendationId", $"rec-{candidate.ListingId:N}");
            var recommendedProduct = ReadString(root, "recommendedProduct", candidate.ProductType ?? candidate.Title);
            var baseResidue = ReadString(root, "baseResidue", candidate.SpecificResidue ?? candidate.ProductType ?? candidate.Title);
            var complexity = NormalizeViabilityLevel(ReadString(root, "complexity", "medium"));
            var totalEstimatedTime = ReadString(root, "totalEstimatedTime", "N/D");
            var approximateCost = ReadString(root, "approximateCost", "N/D");
            var marketPotential = NormalizeViabilityLevel(ReadString(root, "marketPotential", "medium"));
            var principalEquipment = ReadStringArray(root, "principalEquipment", ["Equipo basico"]);
            var expectedOutcome = ReadString(root, "expectedOutcome", "Resultado esperado por validar.");
            var explanation = ReadString(root, "explanation", "Analisis generado por IA.");
            var manufacturingProcess = ReadString(root, "manufacturingProcess", "Proceso por validar en piloto.");

            var complexityOverview = ParseComplexityOverview(root);
            var processSteps = ParseProcessSteps(root);
            var explanationSteps = ParseExplanationSteps(root);
            var environmentalSummary = ParseEnvironmentalSummary(root);
            var marketAnalysis = ParseMarketAnalysis(root, recommendedProduct, expectedOutcome);

            return new ValueRouteDetailDto(
                recommendationId,
                recommendedProduct,
                baseResidue,
                complexity,
                totalEstimatedTime,
                approximateCost,
                marketPotential,
                principalEquipment,
                expectedOutcome,
                explanation,
                explanationSteps,
                environmentalSummary,
                marketAnalysis,
                processSteps,
                "deepseek",
                manufacturingProcess,
                complexityOverview);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ValueRouteComplexityOverviewDto ParseComplexityOverview(JsonElement root)
    {
        if (!TryGetProperty(root, "complexityOverview", out var complexity))
        {
            return new ValueRouteComplexityOverviewDto(null, null, null, null, null, null, null);
        }

        return new ValueRouteComplexityOverviewDto(
            ReadString(complexity, "processingRequired", null),
            ReadString(complexity, "equipmentNeeded", null),
            ReadString(complexity, "technicalKnowledge", null),
            ReadString(complexity, "transformationTime", null),
            ReadString(complexity, "estimatedCost", null),
            ReadString(complexity, "operationalRisk", null),
            ReadString(complexity, "positiveEnvironmentalImpact", null));
    }

    private static IReadOnlyCollection<ValueRouteProcessStepDto> ParseProcessSteps(JsonElement root)
    {
        if (!TryGetProperty(root, "processSteps", out var array) || array.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<ValueRouteProcessStepDto>();
        }

        var result = new List<ValueRouteProcessStepDto>();
        var order = 1;
        foreach (var item in array.EnumerateArray())
        {
            result.Add(new ValueRouteProcessStepDto(
                ReadString(item, "id", $"proc-{order}"),
                NormalizeInt(ReadNullableInt(item, "order"), order, 1, 50),
                ReadString(item, "title", $"Paso {order}"),
                ReadString(item, "shortDescription", "Descripcion no disponible."),
                ReadString(item, "estimatedTime", "N/D"),
                ReadStringArray(item, "requiredEquipment", ["Equipo basico"]),
                ReadStringArray(item, "keyActions", ["Accion clave"]),
                ReadString(item, "quickTip", "Validar en piloto."),
                NormalizeViabilityLevel(ReadString(item, "riskLevel", "medium")),
                NormalizeProcessIcon(ReadString(item, "iconName", "factory"))));
            order++;
        }

        return result;
    }

    private static IReadOnlyCollection<ValueRouteExplanationStepDto> ParseExplanationSteps(JsonElement root)
    {
        if (!TryGetProperty(root, "explanationSteps", out var array) || array.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<ValueRouteExplanationStepDto>();
        }

        var result = new List<ValueRouteExplanationStepDto>();
        var order = 1;
        foreach (var item in array.EnumerateArray())
        {
            var factors = TryGetProperty(item, "environmentalFactors", out var envFactors)
                ? envFactors
                : default;

            var positive = factors.ValueKind == JsonValueKind.Object
                ? ReadStringArray(factors, "positive", ["Aprovechamiento circular"])
                : new[] { "Aprovechamiento circular" };
            var negative = factors.ValueKind == JsonValueKind.Object
                ? ReadStringArray(factors, "negative", ["Validar riesgo operativo"])
                : new[] { "Validar riesgo operativo" };

            result.Add(new ValueRouteExplanationStepDto(
                ReadString(item, "id", $"exp-{order}"),
                NormalizeInt(ReadNullableInt(item, "order"), order, 1, 50),
                ReadString(item, "title", $"Etapa {order}"),
                ReadString(item, "shortLabel", $"Paso {order}"),
                ReadString(item, "transformationType", "Analisis IA"),
                ReadString(item, "whatHappens", "Detalle no disponible."),
                ReadString(item, "whyItMatters", "Impacto por validar."),
                ReadString(item, "transformationOutcome", "Resultado esperado."),
                ReadString(item, "quickTip", "Validar en lote pequeno."),
                ReadString(item, "avoidRisk", "Evitar variaciones no controladas."),
                ReadString(item, "processImageUrl", string.Empty),
                new ValueRouteEnvironmentalFactorsDto(positive, negative),
                ReadStringArray(item, "natureBenefits", ["Economia circular"]),
                NormalizeProcessIcon(ReadString(item, "iconName", "scan-line"))));
            order++;
        }

        return result;
    }

    private static ValueRouteEnvironmentalSummaryDto ParseEnvironmentalSummary(JsonElement root)
    {
        if (!TryGetProperty(root, "environmentalSummary", out var item))
        {
            return new ValueRouteEnvironmentalSummaryDto(5m, "Medio", 50, "Controlado", 30, "Validar siguiente paso.");
        }

        return new ValueRouteEnvironmentalSummaryDto(
            NormalizeDecimal(ReadNullableDecimal(item, "impactScore"), 5m, 0m, 10m),
            ReadString(item, "utilizationLevelLabel", "Medio"),
            NormalizeInt(ReadNullableInt(item, "utilizationPercent"), 50, 0, 100),
            ReadString(item, "environmentalRiskLabel", "Controlado"),
            NormalizeInt(ReadNullableInt(item, "environmentalRiskPercent"), 30, 0, 100),
            ReadString(item, "keyRecommendation", "Validar siguiente paso comercial."));
    }

    private static ValueRouteMarketAnalysisDto ParseMarketAnalysis(JsonElement root, string recommendedProduct, string expectedOutcome)
    {
        if (!TryGetProperty(root, "marketAnalysis", out var item))
        {
            return BuildMinimalMarketAnalysis(recommendedProduct, expectedOutcome);
        }

        var finishedProduct = TryGetPropertyAny(item, out var fp, "finishedProduct", "productoFinal") ? fp : default;
        var buyers = TryGetPropertyAny(item, out var pb, "potentialBuyers", "compradoresPotenciales") ? pb : default;
        var kpis = TryGetPropertyAny(item, out var mk, "marketKpis", "kpisMercado") ? mk : default;
        var costs = TryGetPropertyAny(item, out var cs, "costStructure", "estructuraCostos") ? cs : default;
        var competition = TryGetPropertyAny(item, out var ci, "competitionInsight", "insightCompetencia") ? ci : default;
        var opportunity = TryGetPropertyAny(item, out var os, "opportunitySummary", "resumenOportunidad") ? os : default;

        var parsedBuyers = ParseBuyers(buyers);
        var parsedKpis = ParseKpis(kpis);
        var parsedCosts = ParseCosts(costs);

        return new ValueRouteMarketAnalysisDto(
            new ValueRouteFinishedProductDto(
                ReadStringAny(finishedProduct, recommendedProduct, "name", "nombre"),
                ReadStringAny(finishedProduct, expectedOutcome, "useCase", "casoUso"),
                ReadStringAny(finishedProduct, "Lote", "suggestedFormat", "formatoSugerido", "recommendedFormat"),
                NormalizeDecimal(ReadNullableDecimalAny(finishedProduct, "suggestedPricePerKg", "precioSugeridoPorKg"), 0m, 0m, 100000m),
                ReadStringAny(finishedProduct, "Opportunity: Medium", "opportunityTag", "etiquetaOportunidad"),
                ReadStringAny(finishedProduct, string.Empty, "productImageUrl", "imagenProductoUrl")),
            parsedBuyers,
            parsedKpis,
            parsedCosts,
            NormalizeDecimal(ReadNullableDecimalAny(item, "estimatedGrossMarginPercent", "margenBrutoEstimadoPorcentaje"), 0m, 0m, 100m),
            NormalizeDecimal(ReadNullableDecimalAny(item, "suggestedPricePerKg", "precioSugeridoPorKg"), 0m, 0m, 100000m),
            NormalizeDecimal(ReadNullableDecimalAny(item, "totalCostPerKg", "costoTotalPorKg"), 0m, 0m, 100000m),
            new ValueRouteCompetitionInsightDto(
                ReadStringAny(competition, "N/D", "competitionLevelLabel", "nivelCompetencia"),
                ReadStringArrayAny(competition, ["Sustitutos por validar"], "directSubstitutes", "sustitutosDirectos"),
                ReadStringAny(competition, "Validar posicionamiento comercial.", "positioningRecommendation", "recomendacionPosicionamiento")),
            new ValueRouteOpportunitySummaryDto(
                ReadStringAny(opportunity, DateTime.UtcNow.ToString("yyyy-MM-dd"), "generatedAt", "generadoEn"),
                ReadStringAny(opportunity, "N/D", "initialInvestment", "inversionInicial"),
                ReadStringAny(opportunity, "N/D", "paybackPeriod", "periodoRecuperacion"),
                ReadStringAny(opportunity, "N/D", "monthlyProfitability", "rentabilidadMensual"),
                ReadStringAny(opportunity, "50/100", "sustainabilityScore", "puntajeSostenibilidad"),
                ReadStringArrayAny(opportunity, ["Contactar buyer objetivo"], "nextSteps", "siguientesPasos"),
                ReadStringAny(opportunity, "Mejorar trazabilidad ambiental.", "ecoTip", "ecoConsejo")),
            ReadStringArrayAny(item, ["Confianza IA"], "chartLabels", "etiquetasGrafico"),
            ReadDecimalArrayAny(item, [50m], "chartSeries", "serieGrafico"));
    }

    private static ValueRouteMarketAnalysisDto BuildMinimalMarketAnalysis(string recommendedProduct, string expectedOutcome)
    {
        return new ValueRouteMarketAnalysisDto(
            new ValueRouteFinishedProductDto(recommendedProduct, expectedOutcome, "Lote", 0m, "Opportunity: Medium", string.Empty),
            new[] { new ValueRouteBuyerSegmentDto("buyer-1", "Segmento industrial", "B2B", "N/D", 50, "Directo", "enterprise", "building") },
            new[] { new ValueRouteMarketKpiDto("kpi-1", "Confianza IA", "50%", "Fallback", 50, "slate") },
            new[] { new ValueRouteCostStructureItemDto("cost-1", "Materia prima", 0m, 50) },
            0m,
            0m,
            0m,
            new ValueRouteCompetitionInsightDto("N/D", ["Sustitutos por validar"], "Validar propuesta de valor."),
            new ValueRouteOpportunitySummaryDto(DateTime.UtcNow.ToString("yyyy-MM-dd"), "N/D", "N/D", "N/D", "50/100", ["Contactar buyer objetivo"], "Medir impacto."),
            ["Confianza IA"],
            [50m]);
    }

    private static IReadOnlyCollection<ValueRouteBuyerSegmentDto> ParseBuyers(JsonElement buyers)
    {
        if (buyers.ValueKind != JsonValueKind.Array)
        {
            return new[] { new ValueRouteBuyerSegmentDto("buyer-1", "Segmento industrial", "B2B", "N/D", 50, "Directo", "enterprise", "building") };
        }

        var result = new List<ValueRouteBuyerSegmentDto>();
        var index = 1;
        foreach (var item in buyers.EnumerateArray())
        {
            var type = NormalizeBuyerType(ReadString(item, "type", "enterprise"));
            result.Add(new ValueRouteBuyerSegmentDto(
                ReadStringAny(item, $"buyer-{index}", "id"),
                ReadStringAny(item, $"Buyer {index}", "name", "nombre"),
                ReadStringAny(item, "B2B", "segment", "segmento"),
                ReadStringAny(item, "N/D", "monthlyVolume", "volumenMensual"),
                NormalizeInt(ReadNullableIntAny(item, "probability", "probabilidad"), 50, 0, 100),
                ReadStringAny(item, "Directo", "channel", "canal"),
                type,
                NormalizeBuyerIcon(ReadStringAny(item, type == "retail" ? "store" : "building", "iconName", "icono"))));
            index++;
        }

        return result.Count > 0 ? result : new[] { new ValueRouteBuyerSegmentDto("buyer-1", "Segmento industrial", "B2B", "N/D", 50, "Directo", "enterprise", "building") };
    }

    private static IReadOnlyCollection<ValueRouteMarketKpiDto> ParseKpis(JsonElement kpis)
    {
        if (kpis.ValueKind != JsonValueKind.Array)
        {
            return new[] { new ValueRouteMarketKpiDto("kpi-1", "Confianza IA", "50%", "Fallback", 50, "slate") };
        }

        var result = new List<ValueRouteMarketKpiDto>();
        var index = 1;
        foreach (var item in kpis.EnumerateArray())
        {
            result.Add(new ValueRouteMarketKpiDto(
                ReadStringAny(item, $"kpi-{index}", "id"),
                ReadStringAny(item, "KPI", "label", "etiqueta"),
                ReadStringAny(item, "N/D", "value", "valor"),
                ReadStringAny(item, "N/D", "helper", "ayuda"),
                NormalizeInt(ReadNullableIntAny(item, "trendPercent", "tendenciaPorcentaje"), 0, 0, 100),
                NormalizeTone(ReadStringAny(item, "slate", "tone", "tono"))));
            index++;
        }

        return result.Count > 0 ? result : new[] { new ValueRouteMarketKpiDto("kpi-1", "Confianza IA", "50%", "Fallback", 50, "slate") };
    }

    private static IReadOnlyCollection<ValueRouteCostStructureItemDto> ParseCosts(JsonElement costs)
    {
        if (costs.ValueKind != JsonValueKind.Array)
        {
            return new[] { new ValueRouteCostStructureItemDto("cost-1", "Materia prima", 0m, 50) };
        }

        var result = new List<ValueRouteCostStructureItemDto>();
        var index = 1;
        foreach (var item in costs.EnumerateArray())
        {
            result.Add(new ValueRouteCostStructureItemDto(
                ReadStringAny(item, $"cost-{index}", "id"),
                ReadStringAny(item, "Costo", "label", "etiqueta"),
                NormalizeDecimal(ReadNullableDecimalAny(item, "amountUsd", "montoUsd"), 0m, 0m, 100000m),
                NormalizeInt(ReadNullableIntAny(item, "percent", "porcentaje"), 0, 0, 100)));
            index++;
        }

        return result.Count > 0 ? result : new[] { new ValueRouteCostStructureItemDto("cost-1", "Materia prima", 0m, 50) };
    }

    private static bool TryGetProperty(JsonElement element, string name, out JsonElement value)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.EnumerateObject())
            {
                if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
                {
                    value = property.Value;
                    return true;
                }
            }
        }

        value = default;
        return false;
    }

    private static string ReadString(JsonElement element, string property, string? fallback)
    {
        if (TryGetProperty(element, property, out var value) && value.ValueKind == JsonValueKind.String)
        {
            var text = value.GetString()?.Trim();
            if (!string.IsNullOrWhiteSpace(text))
            {
                return text;
            }
        }

        return fallback ?? string.Empty;
    }

    private static bool TryGetPropertyAny(JsonElement element, out JsonElement value, params string[] names)
    {
        foreach (var name in names)
        {
            if (TryGetProperty(element, name, out value))
            {
                return true;
            }
        }

        value = default;
        return false;
    }

    private static string ReadStringAny(JsonElement element, string fallback, params string[] names)
    {
        foreach (var name in names)
        {
            if (TryGetProperty(element, name, out var value) && value.ValueKind == JsonValueKind.String)
            {
                var text = value.GetString()?.Trim();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }
            }
        }

        return fallback;
    }

    private static IReadOnlyCollection<string> ReadStringArray(JsonElement element, string property, IReadOnlyCollection<string> fallback)
    {
        if (TryGetProperty(element, property, out var value) && value.ValueKind == JsonValueKind.Array)
        {
            var items = value.EnumerateArray()
                .Where(item => item.ValueKind == JsonValueKind.String)
                .Select(item => item.GetString()?.Trim())
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Cast<string>()
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
            if (items.Length > 0)
            {
                return items;
            }
        }

        return fallback;
    }

    private static IReadOnlyCollection<string> ReadStringArrayAny(JsonElement element, IReadOnlyCollection<string> fallback, params string[] names)
    {
        foreach (var name in names)
        {
            var values = ReadStringArray(element, name, Array.Empty<string>());
            if (values.Count > 0)
            {
                return values;
            }
        }

        return fallback;
    }

    private static IReadOnlyCollection<decimal> ReadDecimalArray(JsonElement element, string property, IReadOnlyCollection<decimal> fallback)
    {
        if (TryGetProperty(element, property, out var value) && value.ValueKind == JsonValueKind.Array)
        {
            var items = new List<decimal>();
            foreach (var item in value.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Number && item.TryGetDecimal(out var number))
                {
                    items.Add(number);
                }
            }

            if (items.Count > 0)
            {
                return items;
            }
        }

        return fallback;
    }

    private static IReadOnlyCollection<decimal> ReadDecimalArrayAny(JsonElement element, IReadOnlyCollection<decimal> fallback, params string[] names)
    {
        foreach (var name in names)
        {
            var values = ReadDecimalArray(element, name, Array.Empty<decimal>());
            if (values.Count > 0)
            {
                return values;
            }
        }

        return fallback;
    }

    private static int? ReadNullableInt(JsonElement element, string property)
    {
        if (!TryGetProperty(element, property, out var value))
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number))
        {
            return number;
        }

        if (value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out number))
        {
            return number;
        }

        return null;
    }

    private static int? ReadNullableIntAny(JsonElement element, params string[] names)
    {
        foreach (var name in names)
        {
            var value = ReadNullableInt(element, name);
            if (value.HasValue)
            {
                return value;
            }
        }

        return null;
    }

    private static decimal? ReadNullableDecimal(JsonElement element, string property)
    {
        if (!TryGetProperty(element, property, out var value))
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number))
        {
            return number;
        }

        if (value.ValueKind == JsonValueKind.String && decimal.TryParse(value.GetString(), out number))
        {
            return number;
        }

        return null;
    }

    private static decimal? ReadNullableDecimalAny(JsonElement element, params string[] names)
    {
        foreach (var name in names)
        {
            var value = ReadNullableDecimal(element, name);
            if (value.HasValue)
            {
                return value;
            }
        }

        return null;
    }

    private static int NormalizeInt(int? value, int fallback, int min, int max)
    {
        return value.HasValue ? Math.Clamp(value.Value, min, max) : fallback;
    }

    private static decimal NormalizeDecimal(decimal? value, decimal fallback, decimal min, decimal max)
    {
        return value.HasValue ? Math.Clamp(value.Value, min, max) : fallback;
    }

    private static string NormalizeProcessIcon(string icon)
    {
        return icon switch
        {
            "package-search" or "droplets" or "wind" or "factory" or "scan-line" or "package" or "archive" => icon,
            _ => "factory"
        };
    }

    private static string NormalizeBuyerType(string type)
    {
        return type switch
        {
            "enterprise" or "retail" or "consumer" => type,
            _ => "enterprise"
        };
    }

    private static string NormalizeBuyerIcon(string icon)
    {
        return icon switch
        {
            "building" or "store" or "leaf" => icon,
            _ => "building"
        };
    }

    private static string NormalizeTone(string tone)
    {
        return tone switch
        {
            "emerald" or "slate" or "amber" => tone,
            _ => "slate"
        };
    }
}
