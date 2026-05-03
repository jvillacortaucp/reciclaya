using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Application.ValueSectors.Dtos;

namespace ReciclaYa.Application.Recommendations.Services;

public interface IRecommendationAiGenerator
{
    Task<IReadOnlyCollection<RecommendationDto>> GenerateAsync(
        RecommendationAiContext context,
        CancellationToken cancellationToken = default);

    Task<RecommendationDetailDto?> AnalyzeListingAsync(
        RecommendationAiContext context,
        RecommendationCandidateDto candidate,
        CancellationToken cancellationToken = default);

    Task<ValueRouteDetailDto?> AnalyzeListingProcessAsync(
        RecommendationAiContext context,
        RecommendationCandidateDto candidate,
        string? selectedProductId = null,
        CancellationToken cancellationToken = default);
}
