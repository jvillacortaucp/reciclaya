using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.ValorizationIdeas.Services;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Infrastructure.Options;

namespace ReciclaYa.Infrastructure.AI;

public sealed class DeepSeekValorizationIdeaGenerator(
    HttpClient httpClient,
    IOptions<DeepSeekOptions> options,
    ILogger<DeepSeekValorizationIdeaGenerator> logger) : IValorizationIdeaGenerator
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private static readonly HashSet<string> AllowedStrategies =
    [
        "sell_as_is",
        "transform_before_selling",
        "buy_to_transform",
        "partner_with_processor",
        "use_as_input"
    ];

    private static readonly HashSet<string> AllowedViabilityLevels =
    [
        "low",
        "medium",
        "high"
    ];

    public async Task<IReadOnlyCollection<GeneratedValorizationIdea>> GenerateAsync(
        Listing listing,
        CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
        {
            return BuildFallbackIdeas(listing);
        }

        try
        {
            var content = await RequestIdeasAsync(listing, settings, cancellationToken);
            var ideas = ParseIdeas(content);

            if (ideas.Count != 3)
            {
                logger.LogWarning(
                    "DeepSeek returned an invalid number of valorization ideas for listing {ListingId}. Falling back.",
                    listing.Id);
                return BuildFallbackIdeas(listing);
            }

            return ideas;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "DeepSeek valorization ideas generation failed for listing {ListingId}. Falling back.",
                listing.Id);
            return BuildFallbackIdeas(listing);
        }
    }

    private async Task<string> RequestIdeasAsync(
        Listing listing,
        DeepSeekOptions settings,
        CancellationToken cancellationToken)
    {
        var prompt = BuildPrompt(listing);
        var request = new DeepSeekChatRequest(
            settings.Model,
            [
                new DeepSeekMessage(
                    "system",
                    "Eres un consultor experto en economia circular, agroindustria, valorizacion de residuos y desarrollo de subproductos para MIPYMES peruanas."),
                new DeepSeekMessage("user", prompt)
            ]);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(request, JsonOptions),
                Encoding.UTF8,
                "application/json")
        };

        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);

        using var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning(
                "DeepSeek request failed with status code {StatusCode}. Response body length: {BodyLength}.",
                (int)response.StatusCode,
                rawContent.Length);
            return string.Empty;
        }

        var parsed = JsonSerializer.Deserialize<DeepSeekChatResponse>(rawContent, JsonOptions);
        return parsed?.Choices?.FirstOrDefault()?.Message?.Content ?? string.Empty;
    }

    private IReadOnlyCollection<GeneratedValorizationIdea> ParseIdeas(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
        {
            return Array.Empty<GeneratedValorizationIdea>();
        }

        var json = TryExtractJson(content);
        if (string.IsNullOrWhiteSpace(json))
        {
            return Array.Empty<GeneratedValorizationIdea>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<ValorizationIdeasEnvelope>(json, JsonOptions);
            if (parsed?.Ideas is null || parsed.Ideas.Count != 3)
            {
                return Array.Empty<GeneratedValorizationIdea>();
            }

            return parsed.Ideas
                .Select(ToGeneratedIdea)
                .ToArray();
        }
        catch (JsonException)
        {
            return Array.Empty<GeneratedValorizationIdea>();
        }
    }

    private static GeneratedValorizationIdea ToGeneratedIdea(ValorizationIdeaPayload payload)
    {
        return new GeneratedValorizationIdea(
            CleanText(payload.Title, "Idea de valorizacion"),
            CleanText(payload.Summary, "Alternativa practica para valorizar el residuo."),
            CleanText(payload.SuggestedProduct, "Producto valorizado"),
            CleanText(payload.ProcessOverview, "Clasificar, acondicionar y derivar a un proceso simple de valorizacion."),
            NormalizeCollection(payload.PotentialBuyers),
            NormalizeCollection(payload.RequiredConditions),
            CleanText(payload.SellerRecommendation, "Evalua venderlo a un transformador local si no cuentas con proceso propio."),
            CleanText(payload.BuyerRecommendation, "Puede ser atractivo si tienes capacidad basica para acondicionar y transformar el material."),
            NormalizeStrategy(payload.RecommendedStrategy),
            NormalizeViabilityLevel(payload.ViabilityLevel),
            CleanText(payload.EstimatedImpact, "Ayuda a reducir merma y mejorar el valor comercial del residuo."),
            NormalizeCollection(payload.Warnings),
            "deepseek");
    }

    private static IReadOnlyCollection<GeneratedValorizationIdea> BuildFallbackIdeas(Listing listing)
    {
        var materialName = BuildMaterialName(listing);
        var sector = string.IsNullOrWhiteSpace(listing.Sector) ? "tu operacion" : listing.Sector;

        return
        [
            new GeneratedValorizationIdea(
                $"Compost o abono organico a partir de {materialName}",
                $"El residuo puede acondicionarse para compostaje o produccion de abono de uso agricola en esquemas de pequena o mediana escala.",
                $"Compost de {materialName}",
                "Separar material limpio, controlar humedad, mezclar con estructurantes secos y derivar a compostaje controlado.",
                ["viveros", "productores agricolas", "operadores de compostaje"],
                ["material segregado", "control basico de humedad", "ausencia de contaminantes"],
                "Si no cuentas con operacion de compostaje, puede convenir venderlo a gestores o transformadores locales con capacidad instalada.",
                "Es atractivo si ya manejas compostaje, mezclas organicas o distribucion de insumos agricolas.",
                "sell_as_is",
                "medium",
                "Permite reducir merma organica y convertirla en un insumo con salida comercial local.",
                ["Verifica trazabilidad y ausencia de contaminacion antes de destinarlo a uso agricola."],
                "fallback"),
            new GeneratedValorizationIdea(
                $"Bioinsumo o sustrato tecnico basado en {materialName}",
                $"Puede aprovecharse como sustrato, mezcla organica o material base para procesos simples de valorizacion en {sector}.",
                $"Bioinsumo o sustrato de {materialName}",
                "Acondicionar el residuo, estabilizar humedad, triturar si aplica y preparar lotes homogeneos para transformacion o mezcla.",
                ["fabricantes de bioinsumos", "productores de sustratos", "transformadores locales"],
                ["homogeneidad del material", "almacenamiento seco o controlado", "clasificacion previa"],
                "Si tienes volumen constante, una alianza con un procesador puede capturar mas valor que venderlo sin acondicionar.",
                "Conviene si cuentas con logistica, secado basico o capacidad de mezcla para estandarizar el material.",
                "partner_with_processor",
                "medium",
                "Mejora la valorizacion del residuo y abre opciones de venta a transformadores especializados.",
                ["Validar desempeno tecnico del material antes de ofrecerlo como bioinsumo o sustrato."],
                "fallback"),
            new GeneratedValorizationIdea(
                $"Insumo para alimento animal o producto secundario con {materialName}",
                $"Dependiendo de su inocuidad y composicion, el material puede evaluarse como insumo de alimentacion animal o como base para un subproducto simple.",
                $"Subproducto secundario con {materialName}",
                "Clasificar, revisar inocuidad, acondicionar el material y validar el destino comercial mas seguro segun composicion y estado.",
                ["productores pecuarios", "formuladores de insumos", "emprendimientos de transformacion secundaria"],
                ["evaluacion de inocuidad", "material limpio", "validacion del destino permitido"],
                "No lo comercialices para alimento animal sin validacion tecnica y sanitaria; si no aplica, orientalo a un subproducto no alimentario.",
                "Puede ser una oportunidad si cuentas con evaluacion tecnica para definir si el mejor destino es pecuario o un uso secundario alternativo.",
                "buy_to_transform",
                "low",
                "Abre una ruta adicional de valorizacion, pero requiere mayor validacion para asegurar viabilidad y cumplimiento.",
                ["Para usos alimentarios o pecuarios se requiere evaluacion sanitaria y tecnica previa."],
                "fallback")
        ];
    }

    private static string BuildPrompt(Listing listing)
    {
        return $@"Genera exactamente 3 ideas practicas y comerciales para aprovechar el siguiente residuo, merma o subproducto.

La respuesta debe servir para dos tipos de usuario:
1. Seller: empresa que posee el residuo y quiere decidir si venderlo como esta, transformarlo o buscar compradores.
2. Buyer: empresa o emprendedor que evalua comprar el residuo y quiere saber que puede producir, transformar o comercializar.

Datos del residuo:
- Tipo: {listing.WasteType}
- Sector: {listing.Sector}
- Producto origen: {listing.ProductType}
- Residuo especifico: {listing.SpecificResidue}
- Descripcion: {listing.Description}
- Condicion: {listing.Condition}
- Cantidad: {listing.Quantity} {listing.Unit}
- Ubicacion: {listing.Location}
- Modalidad de intercambio: {listing.ExchangeType}
- Disponibilidad inmediata: {listing.ImmediateAvailability}

Devuelve SOLO JSON valido, sin markdown.

Formato JSON:
{{
  ""ideas"": [
    {{
      ""title"": ""string"",
      ""summary"": ""string"",
      ""suggestedProduct"": ""string"",
      ""processOverview"": ""string"",
      ""potentialBuyers"": [""string""],
      ""requiredConditions"": [""string""],
      ""sellerRecommendation"": ""string"",
      ""buyerRecommendation"": ""string"",
      ""recommendedStrategy"": ""sell_as_is|transform_before_selling|buy_to_transform|partner_with_processor|use_as_input"",
      ""viabilityLevel"": ""low|medium|high"",
      ""estimatedImpact"": ""string"",
      ""warnings"": [""string""]
    }}
  ]
}}

Reglas:
- Las ideas deben ser realistas para MIPYMES peruanas.
- Deben ayudar a vender mejor el residuo o convencer al buyer de comprarlo.
- No sugerir usos peligrosos.
- No inventar certificaciones.
- Si el uso es alimentario, incluir advertencia sanitaria.
- Priorizar usos como compost, bioinsumos, alimento animal, ingredientes secundarios, fibras, extractos, sustratos o insumos industriales simples.
- Lenguaje claro, comercial y accionable.
- Evitar instrucciones quimicas peligrosas o procesos complejos no aptos para MVP.";
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

    private static string BuildMaterialName(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.SpecificResidue))
        {
            return listing.SpecificResidue.Trim();
        }

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return listing.ProductType.Trim();
        }

        return "este residuo";
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

    private static string NormalizeStrategy(string? value)
    {
        var normalized = value?.Trim().ToLowerInvariant() ?? string.Empty;
        return AllowedStrategies.Contains(normalized) ? normalized : "sell_as_is";
    }

    private static string NormalizeViabilityLevel(string? value)
    {
        var normalized = value?.Trim().ToLowerInvariant() ?? string.Empty;
        return AllowedViabilityLevels.Contains(normalized) ? normalized : "medium";
    }

    private static string CleanText(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }

    private sealed record DeepSeekChatRequest(string Model, IReadOnlyCollection<DeepSeekMessage> Messages);

    private sealed record DeepSeekMessage(string Role, string Content);

    private sealed record DeepSeekChatResponse(IReadOnlyCollection<DeepSeekChoice>? Choices);

    private sealed record DeepSeekChoice(DeepSeekMessageResponse? Message);

    private sealed record DeepSeekMessageResponse(string? Content);

    private sealed record ValorizationIdeasEnvelope(IReadOnlyCollection<ValorizationIdeaPayload>? Ideas);

    private sealed record ValorizationIdeaPayload(
        string? Title,
        string? Summary,
        string? SuggestedProduct,
        string? ProcessOverview,
        IReadOnlyCollection<string>? PotentialBuyers,
        IReadOnlyCollection<string>? RequiredConditions,
        string? SellerRecommendation,
        string? BuyerRecommendation,
        string? RecommendedStrategy,
        string? ViabilityLevel,
        string? EstimatedImpact,
        IReadOnlyCollection<string>? Warnings);
}
