using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Regulation.Dtos;
using ReciclaYa.Application.Regulation.Options;
using ReciclaYa.Application.Regulation.Services;

namespace ReciclaYa.Infrastructure.AI;

public sealed class DeepSeekRegulationEvidenceAiVerifier(
    HttpClient httpClient,
    IOptions<RegulationAiOptions> options,
    ILogger<DeepSeekRegulationEvidenceAiVerifier> logger) : IRegulationEvidenceAiVerifier
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<RegulationEvidenceVerificationResultDto?> VerifyAsync(
        RegulationEvidenceVerificationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
        {
            return null;
        }

        var payload = BuildPayload(settings.Model, request);
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);

        using var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Evidence AI request failed with status={StatusCode}", (int)response.StatusCode);
            return null;
        }

        var raw = await response.Content.ReadAsStringAsync(cancellationToken);
        var aiContent = ExtractAssistantContent(raw);
        if (string.IsNullOrWhiteSpace(aiContent))
        {
            return null;
        }

        var json = ExtractJson(aiContent);
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        var parsed = JsonSerializer.Deserialize<EvidenceAiResult>(json, JsonOptions);
        if (parsed is null)
        {
            return null;
        }

        return new RegulationEvidenceVerificationResultDto(
            IsConsistent: parsed.IsConsistent ?? false,
            Confidence: parsed.Confidence ?? 0.5m,
            RiskLevel: string.IsNullOrWhiteSpace(parsed.RiskLevel) ? "medium" : parsed.RiskLevel.Trim().ToLowerInvariant(),
            SuggestedResidue: parsed.SuggestedResidue?.Trim(),
            RiskFlags: parsed.RiskFlags?.Where(item => !string.IsNullOrWhiteSpace(item)).Select(item => item.Trim()).ToArray() ?? [],
            ManualReviewRequired: parsed.ManualReviewRequired ?? false,
            Message: string.IsNullOrWhiteSpace(parsed.Message)
                ? "Validacion completada por IA."
                : parsed.Message.Trim());
    }

    private static string BuildPayload(
        string model,
        RegulationEvidenceVerificationRequestDto request)
    {
        var context = new StringBuilder();
        context.AppendLine("Evalua si el residuo declarado es coherente con la descripcion para publicacion en marketplace.");
        context.AppendLine($"Residuo especifico: {request.SpecificResidue}");
        context.AppendLine($"Tipo de residuo: {request.ResidueType}");
        context.AppendLine($"Sector: {request.Sector}");
        context.AppendLine($"Producto tipo: {request.ProductType}");
        context.AppendLine($"Descripcion detallada: {request.ShortDescription}");
        context.AppendLine($"Cantidad/Unidad: {request.Quantity} {request.Unit}");
        if (!string.IsNullOrWhiteSpace(request.ContextRequiredLevel))
        {
            context.AppendLine($"Nivel regulatorio requerido: {request.ContextRequiredLevel}");
        }
        if (request.ContextAllowedResidues is { Count: > 0 })
        {
            context.AppendLine($"Residuos permitidos de referencia para ese nivel: {string.Join(", ", request.ContextAllowedResidues.Take(20))}");
        }
        if (request.ContextRestrictions is { Count: > 0 })
        {
            context.AppendLine($"Restricciones clave del nivel: {string.Join(" | ", request.ContextRestrictions.Take(8))}");
        }
        context.AppendLine();
        context.AppendLine("Si el residuo parece pertenecer a un nivel superior al requerido, indicalo explicitamente en 'message' con formato: 'Pertenece a levelX'.");
        context.AppendLine("Responde SOLO JSON con este esquema:");
        context.AppendLine("{\"isConsistent\":bool,\"confidence\":0..1,\"riskLevel\":\"low|medium|high\",\"suggestedResidue\":string|null,\"riskFlags\":string[],\"manualReviewRequired\":bool,\"message\":string}");

        var body = new
        {
            model = string.IsNullOrWhiteSpace(model) ? "deepseek-chat" : model,
            temperature = 0.1,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "Eres un verificador tecnico de residuos. No inventes informacion. Valida coherencia texto-contexto. Si detectas que parece de nivel superior al requerido, indicalo en message como 'Pertenece a levelX' (X entre 1 y 4)."
                },
                new
                {
                    role = "user",
                    content = context.ToString()
                }
            }
        };

        return JsonSerializer.Serialize(body, JsonOptions);
    }

    private static string? ExtractAssistantContent(string raw)
    {
        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;
        if (!root.TryGetProperty("choices", out var choices) || choices.ValueKind != JsonValueKind.Array || choices.GetArrayLength() == 0)
        {
            return null;
        }

        var message = choices[0].GetProperty("message");
        if (!message.TryGetProperty("content", out var content))
        {
            return null;
        }

        return content.GetString();
    }

    private static string? ExtractJson(string content)
    {
        var trimmed = content.Trim();
        if (trimmed.StartsWith("```"))
        {
            var firstBrace = trimmed.IndexOf('{');
            var lastBrace = trimmed.LastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace)
            {
                return trimmed[firstBrace..(lastBrace + 1)];
            }
        }

        return trimmed;
    }

    private sealed record EvidenceAiResult(
        bool? IsConsistent,
        decimal? Confidence,
        string? RiskLevel,
        string? SuggestedResidue,
        IReadOnlyCollection<string>? RiskFlags,
        bool? ManualReviewRequired,
        string? Message);
}
