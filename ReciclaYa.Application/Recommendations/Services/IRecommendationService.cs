using ReciclaYa.Application.Recommendations.Dtos;

namespace ReciclaYa.Application.Recommendations.Services;

public interface IRecommendationService
{
    Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsAsync(
        Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}
