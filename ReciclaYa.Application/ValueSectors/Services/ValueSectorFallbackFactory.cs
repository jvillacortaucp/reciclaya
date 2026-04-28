using ReciclaYa.Application.ValueSectors.Dtos;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.ValueSectors.Services;

public sealed class ValueSectorFallbackFactory
{
    public IReadOnlyCollection<ValueSectorRouteDto> BuildFromListing(
        Listing listing,
        string? seed = null,
        IReadOnlyCollection<string>? excludeRouteIds = null,
        IReadOnlyCollection<string>? excludeProductIds = null)
    {
        const int requiredRoutes = 4;
        var residue = ResolveResidue(listing);
        var residueSlug = Slugify(residue);
        var quantityLabel = $"{listing.Quantity:0.##} {listing.Unit}".Trim();
        var location = string.IsNullOrWhiteSpace(listing.Location) ? "tu zona" : listing.Location.Trim();
        var excludedRoutes = new HashSet<string>(
            (excludeRouteIds ?? []).Select(item => Slugify(item)),
            StringComparer.OrdinalIgnoreCase);
        var excludedProducts = new HashSet<string>(
            (excludeProductIds ?? []).Select(item => Slugify(item)),
            StringComparer.OrdinalIgnoreCase);

        var pool = BuildPool(residue, residueSlug, quantityLabel, location)
            .Where(route => !excludedRoutes.Contains(Slugify(route.Id)))
            .Select(route => RemoveExcludedProducts(route, excludedProducts, residue, residueSlug))
            .Where(route => route.Products.Count >= 2)
            .ToList();

        if (pool.Count < requiredRoutes)
        {
            var topUp = BuildPool(residue, residueSlug, quantityLabel, location)
                .Select(route => RemoveExcludedProducts(route, excludedProducts, residue, residueSlug))
                .Where(route => route.Products.Count >= 2)
                .ToList();

            foreach (var item in topUp)
            {
                if (pool.Any(existing => string.Equals(existing.Id, item.Id, StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                pool.Add(item);
                if (pool.Count >= requiredRoutes)
                {
                    break;
                }
            }
        }

        var random = new Random(StableSeed(seed));
        var shuffled = pool.OrderBy(_ => random.Next()).ToList();
        var selected = shuffled.Take(requiredRoutes).ToList();

        if (selected.Count < requiredRoutes)
        {
            var basePool = BuildPool(residue, residueSlug, quantityLabel, location).ToList();
            foreach (var route in basePool)
            {
                if (selected.Any(existing => existing.Id == route.Id))
                {
                    continue;
                }

                selected.Add(route);
                if (selected.Count == requiredRoutes)
                {
                    break;
                }
            }
        }

        return selected.Take(requiredRoutes).ToArray();
    }

    private static string ResolveResidue(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.SpecificResidue))
        {
            return listing.SpecificResidue.Trim();
        }

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return listing.ProductType.Trim();
        }

        if (!string.IsNullOrWhiteSpace(listing.WasteType))
        {
            return listing.WasteType.Trim();
        }

        return "residuo organico";
    }

    private static string Slugify(string value)
    {
        var normalized = new string(value
            .Trim()
            .ToLowerInvariant()
            .Select(character => char.IsLetterOrDigit(character) ? character : '-')
            .ToArray());

        while (normalized.Contains("--", StringComparison.Ordinal))
        {
            normalized = normalized.Replace("--", "-", StringComparison.Ordinal);
        }

        return normalized.Trim('-');
    }

    private static string DefaultImage(string key)
    {
        return key switch
        {
            "compost" => "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1280&q=80",
            "industrial" => "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=1280&q=80",
            _ => "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1280&q=80"
        };
    }

    private static int StableSeed(string? seed)
    {
        if (string.IsNullOrWhiteSpace(seed))
        {
            return DateTime.UtcNow.Millisecond + DateTime.UtcNow.Second * 31;
        }

        unchecked
        {
            var hash = 17;
            foreach (var character in seed.Trim())
            {
                hash = (hash * 31) + character;
            }

            return Math.Abs(hash);
        }
    }

    private static ValueSectorRouteDto RemoveExcludedProducts(
        ValueSectorRouteDto route,
        HashSet<string> excludedProducts,
        string residue,
        string residueSlug)
    {
        var products = route.Products
            .Where(product => !excludedProducts.Contains(Slugify(product.Id)))
            .ToList();

        if (products.Count >= 2)
        {
            return route with { Products = products };
        }

        var filled = new List<ValueSectorProductDto>(products);
        while (filled.Count < 2)
        {
            var suffix = filled.Count + 1;
            filled.Add(new ValueSectorProductDto(
                $"{Slugify(route.Id)}-var-{suffix}-{residueSlug}",
                $"{route.RouteName} alternativo de {residue}",
                $"Alternativa tecnica para {route.RouteName.ToLowerInvariant()} utilizando {residue}.",
                "medium",
                route.MarketPotential,
                $"Uso potencial en {route.RouteName.ToLowerInvariant()} con validacion tecnica local.",
                "fallback"));
        }

        return route with { Products = filled };
    }

    private static IReadOnlyCollection<ValueSectorRouteDto> BuildPool(
        string residue,
        string residueSlug,
        string quantityLabel,
        string location)
    {
        return
        [
            new ValueSectorRouteDto(
                $"agrario-{residueSlug}",
                "Agrario",
                $"Aprovechamiento de {residue} para soluciones de suelo y produccion agricola local.",
                "sprout",
                "medium",
                ["Agricultura", "Viveros", "Compostaje"],
                [
                    new ValueSectorProductDto($"compost-{residueSlug}", $"Compost organico a partir de {residue}", $"Compostaje controlado de {residue} para lotes de {quantityLabel}.", "medium", "medium", "Mejora de suelo y reduccion de fertilizacion quimica.", "fallback"),
                    new ValueSectorProductDto($"sustrato-{residueSlug}", $"Sustrato agricola de {residue}", $"Mezcla tecnica para viveros en {location}.", "medium", "medium", "Produccion de plantines y manejo de viveros.", "fallback")
                ],
                "Ruta inicial de alta adopcion por facilidad operativa.",
                DefaultImage("compost"),
                "fallback"),
            new ValueSectorRouteDto(
                $"alimenticio-{residueSlug}",
                "Alimenticio",
                $"Transformacion de {residue} en insumos funcionales para cadenas alimentarias.",
                "utensils",
                "medium",
                ["Alimentos", "Agroindustria", "Transformadores locales"],
                [
                    new ValueSectorProductDto($"harina-{residueSlug}", $"Harina funcional de {residue}", $"Secado y molienda de {residue} bajo control de calidad.", "high", "medium", "Insumo para formulaciones de valor agregado.", "fallback"),
                    new ValueSectorProductDto($"fibra-{residueSlug}", $"Fibra vegetal procesada de {residue}", $"Fraccionamiento para fibra util en mezclas alimentarias.", "medium", "medium", "Mejorar contenido funcional en productos procesados.", "fallback")
                ],
                "Requiere validacion sanitaria cuando aplique uso alimentario.",
                DefaultImage("industrial"),
                "fallback"),
            new ValueSectorRouteDto(
                $"energetico-{residueSlug}",
                "Energético",
                $"Uso de {residue} como base para energia circular y reduccion de merma.",
                "flame",
                "medium",
                ["Energia", "Industrial", "Servicios"],
                [
                    new ValueSectorProductDto($"biomasa-{residueSlug}", $"Biomasa acondicionada de {residue}", $"Preparacion de {residue} para alimentacion de procesos termicos.", "medium", "medium", "Sustitucion parcial de combustibles convencionales.", "fallback"),
                    new ValueSectorProductDto($"pellets-{residueSlug}", $"Pellets energeticos de {residue}", $"Compactacion de {residue} para uso en calderas.", "high", "medium", "Fuente energetica alternativa para procesos industriales.", "fallback")
                ],
                "Ruta util cuando hay volumen constante y costos de disposicion altos.",
                DefaultImage("materials"),
                "fallback"),
            new ValueSectorRouteDto(
                $"industrial-materiales-{residueSlug}",
                "Industrial y materiales",
                $"Acondicionamiento de {residue} como insumo secundario en manufactura ligera.",
                "package",
                "medium",
                ["Materiales", "Packaging", "Manufactura ligera"],
                [
                    new ValueSectorProductDto($"material-secundario-{residueSlug}", $"Material secundario derivado de {residue}", $"Pretratamiento para venta B2B como insumo tecnico.", "low", "medium", "Abastecimiento para lineas de mezcla industrial.", "fallback"),
                    new ValueSectorProductDto($"mezcla-industrial-{residueSlug}", $"Mezcla industrial con {residue}", $"Combinacion con otros componentes para subproducto funcional.", "medium", "medium", "Pilotos de economia circular industrial.", "fallback")
                ],
                "Enfoque comercial para rotacion rapida y contratos de suministro.",
                DefaultImage("materials"),
                "fallback"),
            new ValueSectorRouteDto(
                $"bioinsumos-{residueSlug}",
                "Bioinsumos",
                $"Valorizacion de {residue} para insumos biologicos de uso agroindustrial.",
                "droplets",
                "medium",
                ["Agro", "Bioinsumos", "Cooperativas"],
                [
                    new ValueSectorProductDto($"extracto-bio-{residueSlug}", $"Extracto bioactivo de {residue}", $"Extraccion liquida para formulaciones bioestimulantes.", "high", "medium", "Bioestimulacion vegetal bajo validacion tecnica.", "fallback"),
                    new ValueSectorProductDto($"enmienda-{residueSlug}", $"Enmienda biologica de {residue}", $"Tratamiento para soporte microbiologico de suelos.", "medium", "medium", "Programas de mejora de suelo y productividad.", "fallback")
                ],
                "Ideal para alianzas con distribuidores de insumos agricolas.",
                DefaultImage("compost"),
                "fallback"),
            new ValueSectorRouteDto(
                $"biomateriales-{residueSlug}",
                "Biomateriales",
                $"Aplicaciones de {residue} para compuestos y materiales de menor impacto.",
                "microscope",
                "medium",
                ["Empaque", "B2B", "Manufactura"],
                [
                    new ValueSectorProductDto($"fibra-compuesta-{residueSlug}", $"Fibra compuesta de {residue}", $"Acondicionamiento de fibra para mezclas tecnicas.", "high", "medium", "Materias primas para piezas livianas.", "fallback"),
                    new ValueSectorProductDto($"biocompuesto-{residueSlug}", $"Biocompuesto con {residue}", $"Base para desarrollos de materiales circulares.", "high", "medium", "Pilotos de nuevos materiales con narrativa sostenible.", "fallback")
                ],
                "Ruta con potencial en pilotos de innovacion industrial.",
                DefaultImage("industrial"),
                "fallback"),
            new ValueSectorRouteDto(
                $"packaging-{residueSlug}",
                "Packaging",
                $"Alternativas de empaque a partir de {residue} para marcas sostenibles.",
                "package",
                "high",
                ["Packaging", "Retail", "Food service"],
                [
                    new ValueSectorProductDto($"bandeja-{residueSlug}", $"Bandeja de fibra de {residue}", $"Moldeo de fibra para envases semirigidos.", "medium", "high", "Empaque compostable para canal retail.", "fallback"),
                    new ValueSectorProductDto($"relleno-{residueSlug}", $"Relleno protector con {residue}", $"Acondicionamiento para embalaje y proteccion de productos.", "low", "medium", "Sustitucion de rellenos sinteticos en despacho.", "fallback")
                ],
                "Ruta de alto valor comercial por demanda de empaques sostenibles.",
                DefaultImage("materials"),
                "fallback"),
            new ValueSectorRouteDto(
                $"cosmetico-{residueSlug}",
                "Cosmético",
                $"Extraccion de compuestos de {residue} para lineas cosmeticas funcionales.",
                "sparkles",
                "medium",
                ["Cosmetica", "Laboratorios", "Wellness"],
                [
                    new ValueSectorProductDto($"extracto-cosmetico-{residueSlug}", $"Extracto cosmetico de {residue}", $"Obtencion de extracto para formulacion topica.", "high", "medium", "Base para lineas de cuidado personal.", "fallback"),
                    new ValueSectorProductDto($"mascarilla-{residueSlug}", $"Base de mascarilla con {residue}", $"Desarrollo de base funcional para productos faciales.", "medium", "medium", "Productos de cuidado personal de origen natural.", "fallback")
                ],
                "Ruta con enfoque en diferenciacion de marca y valor agregado.",
                DefaultImage("industrial"),
                "fallback"),
            new ValueSectorRouteDto(
                $"alimentacion-animal-{residueSlug}",
                "Alimentación animal",
                $"Uso de {residue} en formulaciones para nutricion animal bajo control tecnico.",
                "store",
                "medium",
                ["Ganaderia", "Avicola", "Alimento animal"],
                [
                    new ValueSectorProductDto($"insumo-animal-{residueSlug}", $"Insumo animal de {residue}", $"Pretratamiento para inclusion en dietas animales.", "medium", "medium", "Complemento en formulaciones balanceadas.", "fallback"),
                    new ValueSectorProductDto($"mezcla-animal-{residueSlug}", $"Mezcla nutricional con {residue}", $"Combinacion con otros ingredientes segun formulacion.", "high", "medium", "Uso en cadenas pecuarias con validacion sanitaria.", "fallback")
                ],
                "Requiere validacion sanitaria y formulacion profesional antes de escalar.",
                DefaultImage("compost"),
                "fallback"),
            new ValueSectorRouteDto(
                $"compostaje-tecnico-{residueSlug}",
                "Compostaje técnico",
                $"Linea especializada de compostaje de {residue} con control operacional.",
                "hammer",
                "medium",
                ["Compostaje", "Municipal", "Gestores"],
                [
                    new ValueSectorProductDto($"compost-tecnico-{residueSlug}", $"Compost tecnico de {residue}", $"Proceso controlado por lotes con seguimiento de parametros.", "medium", "medium", "Compost premium para clientes institucionales.", "fallback"),
                    new ValueSectorProductDto($"abono-tecnico-{residueSlug}", $"Abono tecnico de {residue}", $"Formulacion adaptada para distintos tipos de suelo.", "medium", "medium", "Venta por contrato a viveros y campos de cultivo.", "fallback")
                ],
                "Ruta estable para convertir merma en producto comercial repetible.",
                DefaultImage("compost"),
                "fallback")
        ];
    }
}
