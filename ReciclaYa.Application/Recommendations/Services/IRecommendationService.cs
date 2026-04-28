using ReciclaYa.Application.Recommendations.Dtos;

namespace ReciclaYa.Application.Recommendations.Services;

public interface IRecommendationService
{
    Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsAsync(
        Guid userId,
        bool isAdmin,
        int limit = 5,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);

    Task<RecommendationDetailDto?> GetListingAnalysisAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);
}
