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

        var mediaUrls = request.MediaUrls?
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Take(3)
            .Select(item => item.Trim())
            .ToArray() ?? [];

        if (mediaUrls.Length == 0)
        {
            return null;
        }

        var payload = BuildPayload(settings.Model, request, mediaUrls);
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
                ? "Validación completada por IA."
                : parsed.Message.Trim());
    }

    private static string BuildPayload(
        string model,
        RegulationEvidenceVerificationRequestDto request,
        IReadOnlyCollection<string> mediaUrls)
    {
        var context = new StringBuilder();
        context.AppendLine("Evalúa si las imágenes corresponden al residuo declarado para publicación en marketplace.");
        context.AppendLine($"Residuo específico: {request.SpecificResidue}");
        context.AppendLine($"Tipo de residuo: {request.ResidueType}");
        context.AppendLine($"Sector: {request.Sector}");
        context.AppendLine($"Producto tipo: {request.ProductType}");
        context.AppendLine($"Cantidad/Unidad: {request.Quantity} {request.Unit}");
        context.AppendLine();
        context.AppendLine("Responde SOLO JSON con este esquema:");
        context.AppendLine("{\"isConsistent\":bool,\"confidence\":0..1,\"riskLevel\":\"low|medium|high\",\"suggestedResidue\":string|null,\"riskFlags\":string[],\"manualReviewRequired\":bool,\"message\":string}");

        var userContent = new List<object>
        {
            new { type = "text", text = context.ToString() }
        };
        userContent.AddRange(mediaUrls.Select(url => new { type = "image_url", image_url = new { url } }));

        var body = new
        {
            model = string.IsNullOrWhiteSpace(model) ? "deepseek-chat" : model,
            temperature = 0.1,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "Eres un verificador técnico de evidencia visual de residuos. No inventes información."
                },
                new
                {
                    role = "user",
                    content = userContent
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

