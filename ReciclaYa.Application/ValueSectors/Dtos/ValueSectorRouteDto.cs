namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorRouteDto(
    string Id,
    string RouteName,
    string ShortDescription,
    string IconName,
    string MarketPotential,
    IReadOnlyCollection<string> TargetIndustries,
    IReadOnlyCollection<ValueSectorProductDto> Products,
    string Insight,
    string HeroImageUrl,
    string? Source = null);
