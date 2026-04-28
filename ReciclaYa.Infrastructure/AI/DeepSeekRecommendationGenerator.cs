using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Application.Recommendations.Services;
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
}
