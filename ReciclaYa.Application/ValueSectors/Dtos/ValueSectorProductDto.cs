namespace ReciclaYa.Application.ValueSectors.Dtos;

public sealed record ValueSectorProductDto(
    string Id,
    string Name,
    string Description,
    string Complexity,
    string MarketPotential,
    string PotentialUse,
    string? Source = null);
