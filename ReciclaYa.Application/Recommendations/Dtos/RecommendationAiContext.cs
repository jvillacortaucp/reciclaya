namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationAiContext(
    Guid BuyerId,
    int Limit,
    bool IncludeExplanation,
    RecommendationPreferenceDto? Preference,
    IReadOnlyCollection<RecommendationCandidateDto> Candidates);
