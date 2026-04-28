using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Application.ValueSectors.Services;
using ReciclaYa.Infrastructure.Options;

namespace ReciclaYa.Infrastructure.AI;

public sealed class DeepSeekValueSectorGenerator(
    HttpClient httpClient,
    IOptions<DeepSeekOptions> options,
    ILogger<DeepSeekValueSectorGenerator> logger) : IValueSectorAiGenerator
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly HashSet<string> AllowedPotentials = ["low", "medium", "high"];
    private static readonly HashSet<string> AllowedComplexities = ["low", "medium", "high"];
    private static readonly HashSet<string> AllowedIcons =
    [
        "utensils", "sparkles", "pill", "sprout", "flame", "microscope",
        "flask-conical", "droplets", "hammer", "package", "store"
    ];

    public async Task<IReadOnlyCollection<ValueSectorRouteDto>> GenerateRoutesAsync(
        ValueSectorPreviewRequestDto context,
        int limit,
        string? regenerationSeed = null,
        IReadOnlyCollection<string>? excludeRouteIds = null,
        IReadOnlyCollection<string>? excludeProductIds = null,
        CancellationToken cancellationToken = default)
    {
        var apiKey = options.Value.ApiKey?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Array.Empty<ValueSectorRouteDto>();
        }

        try
        {
            var content = await RequestAsync(
                apiKey,
                BuildPrompt(context, limit, regenerationSeed, excludeRouteIds, excludeProductIds),
                cancellationToken);
            var routes = ParseRoutes(content, limit);
            if (routes.Count > limit)
            {
                return routes.Take(limit).ToArray();
            }

            return routes.Count == limit ? routes : Array.Empty<ValueSectorRouteDto>();
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "DeepSeek ValueSectors generation failed.");
            return Array.Empty<ValueSectorRouteDto>();
        }
    }

    private async Task<string> RequestAsync(
        string apiKey,
        string prompt,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        logger.LogInformation(
            "DeepSeek value-sectors request. BaseUrl={BaseUrl}, Model={Model}, ApiKeyConfigured={ApiKeyConfigured}, ApiKeyLength={ApiKeyLength}",
            settings.BaseUrl,
            settings.Model,
            !string.IsNullOrWhiteSpace(apiKey),
            apiKey.Length);

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(
                    new DeepSeekChatRequest(
                        settings.Model,
                        [
                            new DeepSeekMessage(
                                "system",
                                "Eres un asesor experto en economia circular, simbiosis industrial urbana, agroindustria y valorizacion de residuos para MIPYMES peruanas. Debes proponer rutas industriales realistas de aprovechamiento de residuos y subproductos."),
                            new DeepSeekMessage("user", prompt)
                        ]),
                    JsonOptions),
                Encoding.UTF8,
                "application/json")
        };

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        using var response = await httpClient.SendAsync(request, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                logger.LogWarning("DeepSeek ValueSectors unauthorized (401).");
                return string.Empty;
            }

            if ((int)response.StatusCode == 402)
            {
                logger.LogWarning("DeepSeek ValueSectors insufficient balance (402).");
                return string.Empty;
            }

            if (response.StatusCode == (HttpStatusCode)429)
            {
                logger.LogWarning("DeepSeek ValueSectors rate limit (429).");
                return string.Empty;
            }

            logger.LogWarning("DeepSeek ValueSectors failed with status code {StatusCode}.", (int)response.StatusCode);
            return string.Empty;
        }

        var parsed = JsonSerializer.Deserialize<DeepSeekChatResponse>(raw, JsonOptions);
        return parsed?.Choices?.FirstOrDefault()?.Message?.Content ?? string.Empty;
    }

    private static IReadOnlyCollection<ValueSectorRouteDto> ParseRoutes(string content, int expectedCount)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return Array.Empty<ValueSectorRouteDto>();
        }

        var json = TryExtractJson(content);
        if (string.IsNullOrWhiteSpace(json))
        {
            return Array.Empty<ValueSectorRouteDto>();
        }

        try
        {
            var envelope = JsonSerializer.Deserialize<RoutesEnvelope>(json, JsonOptions);
            if (envelope?.Routes is null || envelope.Routes.Count < expectedCount)
            {
                return Array.Empty<ValueSectorRouteDto>();
            }

            var routes = new List<ValueSectorRouteDto>();
            foreach (var route in envelope.Routes)
            {
                var routeId = NormalizeSlug(route.Id);
                var routeName = NormalizeRouteName(Clean(route.RouteName));
                var shortDescription = Clean(route.ShortDescription);
                var insight = Clean(route.Insight);
                var icon = (route.IconName ?? string.Empty).Trim().ToLowerInvariant();
                var marketPotential = (route.MarketPotential ?? string.Empty).Trim().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(routeId)
                    || string.IsNullOrWhiteSpace(routeName)
                    || string.IsNullOrWhiteSpace(shortDescription)
                    || string.IsNullOrWhiteSpace(insight)
                    || !AllowedIcons.Contains(icon)
                    || !AllowedPotentials.Contains(marketPotential))
                {
                    return Array.Empty<ValueSectorRouteDto>();
                }

                var products = new List<ValueSectorProductDto>();
                foreach (var product in route.Products ?? Array.Empty<RouteProductPayload>())
                {
                    var productId = NormalizeSlug(product.Id);
                    var productName = Clean(product.Name);
                    var description = Clean(product.Description);
                    var potentialUse = Clean(product.PotentialUse);
                    var complexity = (product.Complexity ?? string.Empty).Trim().ToLowerInvariant();
                    var productPotential = (product.MarketPotential ?? string.Empty).Trim().ToLowerInvariant();

                    if (string.IsNullOrWhiteSpace(productId)
                        || string.IsNullOrWhiteSpace(productName)
                        || string.IsNullOrWhiteSpace(description)
                        || string.IsNullOrWhiteSpace(potentialUse)
                        || !AllowedComplexities.Contains(complexity)
                        || !AllowedPotentials.Contains(productPotential))
                    {
                        return Array.Empty<ValueSectorRouteDto>();
                    }

                    products.Add(new ValueSectorProductDto(
                        productId,
                        productName,
                        description,
                        complexity,
                        productPotential,
                        potentialUse,
                        "deepseek"));
                }

                if (products.Count < 2)
                {
                    return Array.Empty<ValueSectorRouteDto>();
                }

                routes.Add(new ValueSectorRouteDto(
                    routeId,
                    routeName,
                    shortDescription,
                    icon,
                    marketPotential,
                    NormalizeCollection(route.TargetIndustries),
                    products,
                    insight,
                    Clean(route.HeroImageUrl, "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1280&q=80"),
                    "deepseek"));
            }

            if (routes.Count < expectedCount)
            {
                return Array.Empty<ValueSectorRouteDto>();
            }

            return routes.Take(expectedCount).ToArray();
        }
        catch (JsonException)
        {
            return Array.Empty<ValueSectorRouteDto>();
        }
    }

    private static string BuildPrompt(
        ValueSectorPreviewRequestDto context,
        int limit,
        string? regenerationSeed,
        IReadOnlyCollection<string>? excludeRouteIds,
        IReadOnlyCollection<string>? excludeProductIds)
    {
        var seed = string.IsNullOrWhiteSpace(regenerationSeed)
            ? DateTime.UtcNow.Ticks.ToString()
            : regenerationSeed.Trim();
        var routeExclusions = (excludeRouteIds ?? [])
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .ToArray();
        var productExclusions = (excludeProductIds ?? [])
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .ToArray();

        return $@"Genera exactamente {limit} rutas de sector de valor para el residuo o contexto indicado.

Contexto:
- sector: {context.Sector}
- residueType: {context.ResidueType}
- productType: {context.ProductType}
- specificResidue: {context.SpecificResidue}
- description: {context.Description}
- condition: {context.Condition}
- quantity: {context.Quantity}
- unit: {context.Unit}
- location: {context.Location}
- exchangeType: {context.ExchangeType}
- regenerationSeed: {seed}
- excludeRouteIds: [{string.Join(", ", routeExclusions)}]
- excludeProductIds: [{string.Join(", ", productExclusions)}]

Devuelve SOLO JSON valido, sin markdown, con esta forma exacta:
{{
  ""routes"": [
    {{
      ""id"": ""string"",
      ""routeName"": ""string"",
      ""shortDescription"": ""string"",
      ""iconName"": ""utensils|sparkles|pill|sprout|flame|microscope|flask-conical|droplets|hammer|package|store"",
      ""marketPotential"": ""low|medium|high"",
      ""targetIndustries"": [""string""],
      ""products"": [
        {{
          ""id"": ""string"",
          ""name"": ""string"",
          ""description"": ""string"",
          ""complexity"": ""low|medium|high"",
          ""marketPotential"": ""low|medium|high"",
          ""potentialUse"": ""string""
        }}
      ],
      ""insight"": ""string"",
      ""heroImageUrl"": ""string""
    }}
  ]
}}

Reglas:
- Devuelve exactamente {limit} rutas.
- routeName debe ser solo el nombre del sector o ruta industrial.
- No inicies routeName con la palabra ""Sector"".
- Cada ruta debe tener al menos 2 productos.
- Los ids deben ser slugs estables navegables.
- No inventes certificaciones.
- No sugieras usos peligrosos.
- Si el uso es alimentario, animal o agricola, menciona validacion sanitaria o tecnica en insight o potentialUse.
- complexity solo puede ser low, medium o high.
- marketPotential solo puede ser low, medium o high.
- iconName solo puede usar los valores permitidos.
- Usa sectores/rutas variados en cada respuesta.
- En regeneraciones, evita repetir exactamente las mismas rutas y productos excluidos; si repites sector, cambia enfoque y productos.
- Lenguaje claro, comercial y util para MIPYMES peruanas.
- Priorizar sectores industriales reales: Agrario, Alimenticio, Energetico, Industrial y materiales, Bioinsumos, Biomateriales, Packaging, Cosmetico, Nutraceutico, Alimentacion animal, Compostaje tecnico, Manufactura ligera, Economia circular local, Insumos agricolas, Extractos naturales, Fibras vegetales.";
    }

    private static string NormalizeSlug(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = new string(value
            .Trim()
            .ToLowerInvariant()
            .Select(character =>
            {
                if (char.IsLetterOrDigit(character))
                {
                    return character;
                }

                return '-';
            })
            .ToArray());

        while (normalized.Contains("--", StringComparison.Ordinal))
        {
            normalized = normalized.Replace("--", "-", StringComparison.Ordinal);
        }

        return normalized.Trim('-');
    }

    private static string Clean(string? value, string fallback = "")
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }

    private static string NormalizeRouteName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim();
        if (normalized.StartsWith("Sector ", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized[7..].Trim();
        }

        return normalized;
    }

    private static IReadOnlyCollection<string> NormalizeCollection(IReadOnlyCollection<string>? items)
    {
        var normalized = items?
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
            ?? [];

        return normalized.Length > 0 ? normalized : ["Mercado circular"];
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

    private sealed record RoutesEnvelope(IReadOnlyCollection<RoutePayload>? Routes);

    private sealed record RoutePayload(
        string? Id,
        string? RouteName,
        string? ShortDescription,
        string? IconName,
        string? MarketPotential,
        IReadOnlyCollection<string>? TargetIndustries,
        IReadOnlyCollection<RouteProductPayload>? Products,
        string? Insight,
        string? HeroImageUrl);

    private sealed record RouteProductPayload(
        string? Id,
        string? Name,
        string? Description,
        string? Complexity,
        string? MarketPotential,
        string? PotentialUse);
}
