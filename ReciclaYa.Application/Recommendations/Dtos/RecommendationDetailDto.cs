namespace ReciclaYa.Application.Recommendations.Dtos;

// Obsoleto: se unifica el contrato con ValueRouteDetailDto
// Mantener record por compatibilidad interna si es referenciado en otros módulos.
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
