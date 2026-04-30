namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record ChatbotRecommendationAnalysisRequestDto(
    string ProductId,
    string ProductName,
    string ResidueInput,
    string SectorName,
    string? Description,
    string? Complexity,
    string? MarketPotential);
