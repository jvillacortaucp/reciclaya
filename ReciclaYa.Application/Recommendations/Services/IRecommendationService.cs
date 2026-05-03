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

    Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto?> GetListingAnalysisAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        string? selectedProductId = null,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);

    Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto> GetChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);
}
