namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationDto(
    string Id,
    string Title,
    int ConfidenceScore,
    string Reason,
    Guid ListingId);
