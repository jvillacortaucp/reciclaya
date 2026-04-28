using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.ValueSectors.Dtos;

namespace ReciclaYa.Application.ValueSectors.Services;

public sealed class ValueSectorService(
    IAuthDbContext dbContext,
    IValueSectorAiGenerator aiGenerator,
    ValueSectorFallbackFactory fallbackFactory,
    ILogger<ValueSectorService> logger) : IValueSectorService
{
    private static readonly IReadOnlyCollection<ValueSectorRouteDto> Catalog = BuildCatalog();
    private static readonly HashSet<string> AllowedPotentials = ["low", "medium", "high"];
    private static readonly HashSet<string> AllowedComplexities = ["low", "medium", "high"];

    public Task<bool> ListingExistsAsync(
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Listings
            .AsNoTracking()
            .AnyAsync(item => item.Id == listingId && item.DeletedAt == null, cancellationToken);
    }

    public Task<bool> IsListingOwnedByAsync(
        Guid listingId,
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Listings
            .AsNoTracking()
            .AnyAsync(item => item.Id == listingId && item.SellerId == sellerId && item.DeletedAt == null, cancellationToken);
    }

    public async Task<ValueSectorListingSummaryDto?> GetListingSummaryAsync(
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == listingId && item.DeletedAt == null, cancellationToken);

        return listing is null ? null : ToListingSummary(listing);
    }

    public async Task<ValueSectorPageResponseDto> GetPageAsync(
        ValueSectorQueryDto query,
        CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 25);
        var limit = query.Limit.HasValue ? Math.Clamp(query.Limit.Value, 1, 25) : (int?)null;

        if (query.ListingId.HasValue)
        {
            var fromListing = await GetFromListingAsync(
                query.ListingId.Value,
                query.UseAi,
                limit,
                cancellationToken);
            return ToPage(fromListing?.Routes ?? [], page, pageSize);
        }

        var baseItems = FilterCatalog(Catalog, query);
        if (query.UseAi && HasContext(query))
        {
            var aiItems = await aiGenerator.GenerateRoutesAsync(
                new ValueSectorPreviewRequestDto(
                    query.ResidueType,
                    query.Sector,
                    query.ProductType,
                    query.SpecificResidue,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    true),
                Math.Clamp(limit ?? 6, 1, 10),
                cancellationToken: cancellationToken);

            if (aiItems.Count > 0)
            {
                baseItems = aiItems;
            }
        }

        if (limit.HasValue)
        {
            baseItems = baseItems.Take(limit.Value).ToArray();
        }

        return ToPage(baseItems, page, pageSize);
    }

    public Task<ValueSectorRouteDto?> GetRouteAsync(
        string routeId,
        CancellationToken cancellationToken = default)
    {
        var route = Catalog.FirstOrDefault(item =>
            string.Equals(item.Id, routeId, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(route);
    }

    public Task<ValueRouteDetailDto?> GetProductDetailAsync(
        string productId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(productId))
        {
            return Task.FromResult<ValueRouteDetailDto?>(null);
        }

        var normalized = productId.Trim().ToLowerInvariant();
        var route = Catalog.FirstOrDefault(item =>
            item.Products.Any(product => string.Equals(product.Id, normalized, StringComparison.OrdinalIgnoreCase)));
        var product = route?.Products.FirstOrDefault(item =>
            string.Equals(item.Id, normalized, StringComparison.OrdinalIgnoreCase));

        if (product is null)
        {
            product = new ValueSectorProductDto(
                normalized,
                ToTitle(normalized),
                "Ruta industrial potencial para valorizacion circular.",
                "medium",
                "medium",
                $"Aplicacion industrial sugerida para {ToTitle(normalized)}.",
                "fallback");
        }

        var baseResidue = route?.RouteName ?? "Residuo industrial";
        var source = product.Source ?? route?.Source ?? "fallback";
        var marketPotential = AllowedPotentials.Contains(product.MarketPotential) ? product.MarketPotential : "medium";
        var complexity = AllowedComplexities.Contains(product.Complexity) ? product.Complexity : "medium";

        return Task.FromResult<ValueRouteDetailDto?>(BuildDetailDto(product, baseResidue, marketPotential, complexity, source));
    }

    public async Task<IReadOnlyCollection<ValueSectorRouteDto>> PreviewAsync(
        ValueSectorPreviewRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (request.UseAi)
        {
            var aiRoutes = await aiGenerator.GenerateRoutesAsync(
                request,
                6,
                cancellationToken: cancellationToken);
            if (aiRoutes.Count > 0)
            {
                return aiRoutes;
            }
        }

        return FilterCatalog(Catalog, new ValueSectorQueryDto(
                request.Sector,
                request.ResidueType,
                request.ProductType,
                request.SpecificResidue,
                null,
                false,
                6,
                1,
                6))
            .Take(6)
            .ToArray();
    }

    public async Task<ValueSectorFromListingResponseDto?> GetFromListingAsync(
        Guid listingId,
        bool useAi = true,
        int? limit = null,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == listingId && item.DeletedAt == null, cancellationToken);

        if (listing is null)
        {
            return null;
        }

        logger.LogInformation(
            "ValueSector GET from listing. ListingId={ListingId}, Status={Status}, UseAi={UseAi}",
            listingId,
            listing.Status,
            useAi);

        return new ValueSectorFromListingResponseDto(ToListingSummary(listing), []);
    }

    public async Task<ValueSectorFromListingResponseDto?> GenerateFromListingAsync(
        Guid listingId,
        ValueSectorGenerateRequestDto? request = null,
        int? limit = null,
        CancellationToken cancellationToken = default)
    {
        var safeLimit = 4;
        var seed = request?.RegenerationSeed;
        var excludeRouteIds = request?.ExcludeRouteIds ?? [];
        var excludeProductIds = request?.ExcludeProductIds ?? [];
        var listing = await dbContext.Listings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == listingId && item.DeletedAt == null, cancellationToken);

        if (listing is null)
        {
            return null;
        }

        logger.LogInformation(
            "ValueSector POST generate. ListingId={ListingId}, Status={Status}, Limit={Limit}",
            listingId,
            listing.Status,
            safeLimit);

        var aiRoutes = await aiGenerator.GenerateRoutesAsync(
            new ValueSectorPreviewRequestDto(
                listing.WasteType,
                listing.Sector,
                listing.ProductType,
                listing.SpecificResidue,
                listing.Description,
                listing.Condition,
                listing.Quantity,
                listing.Unit,
                listing.Location,
                listing.ExchangeType,
                true),
            safeLimit,
            seed,
            excludeRouteIds,
            excludeProductIds,
            cancellationToken);

        var routes = aiRoutes;
        if (routes.Count < safeLimit)
        {
            var fallback = fallbackFactory.BuildFromListing(listing, seed, excludeRouteIds, excludeProductIds)
                .Take(safeLimit)
                .ToArray();

            logger.LogWarning(
                "ValueSector generate fallback used. ListingId={ListingId}, FallbackCount={Count}",
                listingId,
                fallback.Length);

            routes = fallback;
        }

        if (routes.Count == 0)
        {
            routes = fallbackFactory.BuildFromListing(listing, seed, excludeRouteIds, excludeProductIds).ToArray();
        }

        routes = routes
            .Select(route => route with
            {
                RouteName = NormalizeRouteName(route.RouteName)
            })
            .Where(route => !string.IsNullOrWhiteSpace(route.RouteName))
            .Take(safeLimit)
            .ToArray();

        if (routes.Count < safeLimit)
        {
            routes = fallbackFactory.BuildFromListing(listing, seed, excludeRouteIds, excludeProductIds)
                .Select(route => route with { RouteName = NormalizeRouteName(route.RouteName) })
                .Where(route => !string.IsNullOrWhiteSpace(route.RouteName))
                .Take(safeLimit)
                .ToArray();
        }

        logger.LogInformation(
            "ValueSector generate completed. ListingId={ListingId}, RouteCount={Count}",
            listingId,
            routes.Count);

        return new ValueSectorFromListingResponseDto(ToListingSummary(listing), routes);
    }

    private static ValueRouteDetailDto BuildDetailDto(
        ValueSectorProductDto product,
        string baseResidue,
        string marketPotential,
        string complexity,
        string source)
    {
        return new ValueRouteDetailDto(
            $"rec-{product.Id}",
            product.Name,
            baseResidue,
            complexity,
            "18-24 horas",
            "$420 por lote piloto",
            marketPotential,
            ["Lavadora industrial", "Secador", "Molino fino", "Tamiz"],
            "Resultado estable con enfoque comercial para MIPYMES.",
            $"La ruta prioriza valorizacion practica para {product.Name}.",
            [
                new ValueRouteExplanationStepDto(
                    "exp-1",
                    1,
                    "Evaluacion de materia prima",
                    "Evaluacion",
                    "Preacondicionamiento",
                    "Se revisa calidad inicial y trazabilidad del material.",
                    "Reduce riesgos de rechazo en lotes comerciales.",
                    "Materia lista para procesamiento.",
                    "Trabaja por lotes pequenos para mejor control.",
                    "No mezclar material contaminado.",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1280&q=80",
                    new ValueRouteEnvironmentalFactorsDto(
                        ["Reduce merma y mejora aprovechamiento."],
                        ["Requiere control basico de limpieza."]),
                    ["Economia circular", "Reduccion de residuos"],
                    "package-search"),
                new ValueRouteExplanationStepDto(
                    "exp-2",
                    2,
                    "Transformacion principal",
                    "Transformacion",
                    "Proceso industrial",
                    product.Description,
                    "Permite generar producto valorizado con salida comercial.",
                    $"Producto sugerido: {product.PotentialUse}",
                    "Validar muestras antes de escalar.",
                    "Evitar condiciones fuera de especificacion.",
                    "https://images.unsplash.com/photo-1620395219863-c3e4f9d9f911?auto=format&fit=crop&w=1280&q=80",
                    new ValueRouteEnvironmentalFactorsDto(
                        ["Aprovecha subproductos de forma rentable."],
                        ["Requiere seguimiento operativo."]),
                    ["Aprovecha recursos", "Producto de valor"],
                    "factory")
            ],
            new ValueRouteEnvironmentalSummaryDto(
                8.1m,
                "Alto",
                88,
                "Bajo",
                22,
                "Priorizar control de calidad y trazabilidad."),
            new ValueRouteMarketAnalysisDto(
                new ValueRouteFinishedProductDto(
                    product.Name,
                    product.PotentialUse,
                    "Saco 25kg / Presentacion B2B",
                    4.5m,
                    "Opportunity: High",
                    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1280&q=80"),
                [
                    new ValueRouteBuyerSegmentDto("buyer-1", "Empresas industriales", "B2B", "10-20 t/mes", 82, "Directo", "enterprise", "building"),
                    new ValueRouteBuyerSegmentDto("buyer-2", "Canal retail especializado", "Retail", "0.5-1 t/mes", 64, "Distribuidores", "retail", "store")
                ],
                [
                    new ValueRouteMarketKpiDto("impact", "Impact", "High", "Demanda en expansion", 78, "emerald"),
                    new ValueRouteMarketKpiDto("competition", "Competition", "Medium", "Mercado en consolidacion", 48, "amber")
                ],
                [
                    new ValueRouteCostStructureItemDto("raw", "Materia prima", 0.8m, 20),
                    new ValueRouteCostStructureItemDto("process", "Procesamiento", 1.8m, 45),
                    new ValueRouteCostStructureItemDto("packaging", "Empaque", 0.7m, 18),
                    new ValueRouteCostStructureItemDto("logistics", "Logistica", 0.7m, 17)
                ],
                42.3m,
                4.5m,
                4.0m,
                new ValueRouteCompetitionInsightDto(
                    "Nivel: Medio",
                    ["Sustitutos convencionales", "Material importado"],
                    "Posicionar por trazabilidad circular y disponibilidad local."),
                new ValueRouteOpportunitySummaryDto(
                    "Analisis generado hoy",
                    "$1,500",
                    "4-6 meses",
                    "$3,200",
                    "A",
                    ["Validar muestra comercial.", "Pilotear con 1-2 compradores.", "Escalar por lotes."],
                    "La narrativa de circularidad mejora conversion comercial."),
                ["Materia prima", "Procesamiento", "Empaque", "Logistica"],
                [20m, 45m, 18m, 17m]),
            [
                new ValueRouteProcessStepDto(
                    "step-1",
                    1,
                    "Seleccion y acondicionamiento",
                    "Clasificar y preparar material de entrada.",
                    "2 horas",
                    ["Mesas de clasificacion", "Bandejas"],
                    ["Separar material apto.", "Retirar impurezas."],
                    "Registrar lote desde el inicio.",
                    "low",
                    "package-search"),
                new ValueRouteProcessStepDto(
                    "step-2",
                    2,
                    "Transformacion y control",
                    "Aplicar proceso principal y validar parametros.",
                    "6 horas",
                    ["Equipo de proceso", "Instrumentos de control"],
                    ["Ejecutar transformacion.", "Verificar especificaciones."],
                    "Monitorear variaciones de humedad y tamano.",
                    "medium",
                    "factory"),
                new ValueRouteProcessStepDto(
                    "step-3",
                    3,
                    "Empaque y salida comercial",
                    "Empacar y preparar para despacho.",
                    "2 horas",
                    ["Selladora", "Etiquetadora"],
                    ["Empacar por formato.", "Etiquetar y despachar."],
                    "Usar FIFO para estabilidad de inventario.",
                    "low",
                    "package")
            ],
            source);
    }

    private static ValueSectorPageResponseDto ToPage(
        IReadOnlyCollection<ValueSectorRouteDto> source,
        int page,
        int pageSize)
    {
        var total = source.Count;
        var start = (page - 1) * pageSize;
        var items = source.Skip(start).Take(pageSize).ToArray();
        var hasMore = start + pageSize < total;

        return new ValueSectorPageResponseDto(items, total, page, pageSize, hasMore);
    }

    private static IReadOnlyCollection<ValueSectorRouteDto> FilterCatalog(
        IReadOnlyCollection<ValueSectorRouteDto> source,
        ValueSectorQueryDto query)
    {
        var filtered = source.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(query.Sector))
        {
            filtered = filtered.Where(item =>
                item.RouteName.Contains(query.Sector, StringComparison.OrdinalIgnoreCase)
                || item.TargetIndustries.Any(industry =>
                    industry.Contains(query.Sector, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.ResidueType))
        {
            filtered = filtered.Where(item =>
                item.Insight.Contains(query.ResidueType, StringComparison.OrdinalIgnoreCase)
                || item.ShortDescription.Contains(query.ResidueType, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.ProductType))
        {
            filtered = filtered.Where(item =>
                item.Products.Any(product =>
                    product.Name.Contains(query.ProductType, StringComparison.OrdinalIgnoreCase)
                    || product.Description.Contains(query.ProductType, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(query.SpecificResidue))
        {
            filtered = filtered.Where(item =>
                item.Insight.Contains(query.SpecificResidue, StringComparison.OrdinalIgnoreCase)
                || item.Products.Any(product =>
                    product.PotentialUse.Contains(query.SpecificResidue, StringComparison.OrdinalIgnoreCase)));
        }

        return filtered.ToArray();
    }

    private static bool HasContext(ValueSectorQueryDto query)
    {
        return !string.IsNullOrWhiteSpace(query.Sector)
            || !string.IsNullOrWhiteSpace(query.ResidueType)
            || !string.IsNullOrWhiteSpace(query.ProductType)
            || !string.IsNullOrWhiteSpace(query.SpecificResidue);
    }

    private static string ToTitle(string slug)
    {
        return string.Join(" ",
            slug
                .Split('-', StringSplitOptions.RemoveEmptyEntries)
                .Select(chunk => char.ToUpperInvariant(chunk[0]) + chunk[1..]));
    }

    private static ValueSectorListingSummaryDto ToListingSummary(Domain.Entities.Listing listing)
    {
        return new ValueSectorListingSummaryDto(
            listing.Id,
            listing.SpecificResidue,
            listing.ProductType,
            listing.WasteType,
            listing.Sector,
            listing.Description,
            listing.Condition,
            listing.Quantity,
            listing.Unit,
            listing.Location,
            listing.ExchangeType,
            listing.Status.ToString().ToLowerInvariant());
    }

    private static IReadOnlyCollection<ValueSectorRouteDto> BuildCatalog()
    {
        return
        [
            new ValueSectorRouteDto(
                "alimentaria",
                "Alimentaria",
                "Valorizacion de fibra y compuestos funcionales para formulaciones food-grade.",
                "utensils",
                "high",
                ["Food", "Bakery", "Retail"],
                [
                    new ValueSectorProductDto("harina-funcional", "Harina funcional", "Base para panificacion y mezclas nutricionales.", "medium", "high", "Panificados funcionales y mezclas enriquecidas"),
                    new ValueSectorProductDto("snacks-saludables", "Snacks saludables", "Insumo para snacks horneados de alto valor.", "low", "medium", "Snacks altos en fibra para retail"),
                    new ValueSectorProductDto("fibra-alimentaria", "Fibra alimentaria", "Aditivo natural para mejorar contenido de fibra.", "medium", "high", "Fortificacion de productos procesados")
                ],
                "La cascara de mango es rica en fibra soluble y compuestos funcionales.",
                "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "nutraceutica",
                "Nutraceutica",
                "Concentrados vitaminicos y suplementos dieteticos de alto margen.",
                "pill",
                "high",
                ["Nutricion", "Farmacia", "Wellness"],
                [
                    new ValueSectorProductDto("capsulas-fibra", "Capsulas de fibra", "Suplemento digestivo de rapida formulacion.", "high", "high", "Linea premium de salud digestiva"),
                    new ValueSectorProductDto("blend-vitaminico", "Blend vitaminico", "Mezcla funcional para nutraceuticos premium.", "high", "medium", "Sachet funcional para canales farmacias")
                ],
                "El fraccionamiento en polvo micronizado mejora biodisponibilidad para suplementos.",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "cosmetica",
                "Cosmetica",
                "Extraccion de antioxidantes para serums y mascarillas.",
                "sparkles",
                "medium",
                ["Beauty", "Dermocosmetica", "Laboratorio"],
                [
                    new ValueSectorProductDto("extracto-polifenoles", "Extracto de polifenoles", "Activo antioxidante para formulacion anti-edad.", "medium", "high", "Cosmetica funcional de alta rotacion"),
                    new ValueSectorProductDto("serum-botanico", "Serum botanico", "Concentrado base para cuidado facial.", "high", "medium", "Lineas premium clean beauty")
                ],
                "Los extractos antioxidantes derivados de mango elevan margen en lineas cosmeticas naturales.",
                "https://images.unsplash.com/photo-1556228720-da4e85f25d1b?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "agricultura",
                "Agricultura",
                "Aplicaciones para nutricion vegetal y suelos regenerativos.",
                "sprout",
                "medium",
                ["Agricola", "Agrotech", "Cooperativas"],
                [
                    new ValueSectorProductDto("compost-premium", "Compost premium", "Base organica estabilizada para fertilizacion.", "low", "medium", "Programas de suelo regenerativo"),
                    new ValueSectorProductDto("bioestimulante", "Bioestimulante liquido", "Extracto para potenciar crecimiento vegetal.", "medium", "medium", "Cultivos de alto valor agroexportador")
                ],
                "La biomasa residual puede convertirse en mejoradores de suelo de bajo costo.",
                "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "energia",
                "Energia",
                "Aprovechamiento para bioenergia y combustibles alternativos.",
                "flame",
                "medium",
                ["Bioenergia", "Industrial", "Servicios"],
                [
                    new ValueSectorProductDto("sustrato-biogas", "Sustrato para biogas", "Materia organica para digestores anaerobicos.", "medium", "medium", "Plantas de biogas industriales"),
                    new ValueSectorProductDto("pellet-biomasa", "Pellet de biomasa", "Combustible solido para calderas industriales.", "medium", "medium", "Sustitucion parcial de combustibles fosiles")
                ],
                "La valorizacion energetica reduce costos de disposicion y mejora huella ambiental.",
                "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "biomateriales",
                "Biomateriales",
                "Compuestos biodegradables para empaques y piezas circulares.",
                "microscope",
                "medium",
                ["Empaque", "Manufactura", "B2B"],
                [
                    new ValueSectorProductDto("biopellet", "Biopellet", "Materia prima para extrusion de piezas.", "high", "medium", "Piezas livianas industriales"),
                    new ValueSectorProductDto("compuesto-biopolimero", "Compuesto biopolimero", "Mezcla para empaque compostable.", "high", "high", "Empaques con menor impacto ambiental")
                ],
                "Mezclas con biopolimeros habilitan empaques compostables para retail.",
                "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "packaging",
                "Packaging",
                "Empaques compostables y recubrimientos biodegradables.",
                "package",
                "high",
                ["Packaging", "Retail", "E-commerce"],
                [
                    new ValueSectorProductDto("bandeja-fibra", "Bandeja de fibra", "Sustituto compostable para bandejas plasticas.", "medium", "high", "Canal retail y food service"),
                    new ValueSectorProductDto("film-biodegradable", "Film biodegradable", "Recubrimiento flexible de origen natural.", "high", "high", "Empaque flexible sostenible")
                ],
                "Empaques sostenibles mejoran percepcion de marca y habilitan certificaciones verdes.",
                "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1280&q=80"),
            new ValueSectorRouteDto(
                "marketplace",
                "Marketplace",
                "Comercializacion directa de lotes clasificados por calidad.",
                "store",
                "high",
                ["B2B", "Exportacion", "Distribucion"],
                [
                    new ValueSectorProductDto("lote-estandarizado", "Lote estandarizado", "Oferta comercial con trazabilidad y ficha tecnica.", "low", "high", "Venta rapida en canales B2B"),
                    new ValueSectorProductDto("contrato-suministro", "Contrato de suministro", "Esquema de abastecimiento recurrente.", "medium", "high", "Asegurar demanda estable")
                ],
                "La venta estructurada por lotes acelera rotacion y mejora ticket promedio.",
                "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1280&q=80")
        ];
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
}
