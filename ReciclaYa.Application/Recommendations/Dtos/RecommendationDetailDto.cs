namespace ReciclaYa.Application.Recommendations.Dtos;

// Contrato del endpoint de analisis por listing en recomendaciones.
public sealed record RecommendationDetailDto(
    Guid ListingId,
    string ListingTitle,
    string AiExplanation,
    string RecommendedUse,
    string BuyerBenefit,
    string SuggestedAction,
    IReadOnlyCollection<string> PotentialProducts,
    IReadOnlyCollection<string> RequiredConditions,
    IReadOnlyCollection<string> Risks,
    string NextStep,
    int ConfidenceScore,
    string ViabilityLevel,
    string Source);
