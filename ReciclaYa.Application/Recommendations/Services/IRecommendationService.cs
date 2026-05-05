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

    Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto?> SaveListingAnalysisAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        string? selectedProductId = null,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);

    Task<RecommendationAnalysisRecordDto?> GetLatestListingAnalysisAsync(
        Guid listingId,
        string? selectedProductId = null,
        CancellationToken cancellationToken = default);

    Task<RecommendationAnalysisHistoryPageDto> GetListingAnalysisHistoryAsync(
        Guid listingId,
        string? selectedProductId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto> GetChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);

    Task<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto> SaveChatbotAnalysisAsync(
        Guid userId,
        ChatbotRecommendationAnalysisRequestDto request,
        bool useAi = true,
        bool includeExplanation = true,
        CancellationToken cancellationToken = default);

    Task<RecommendationAnalysisRecordDto?> GetLatestChatbotAnalysisAsync(
        Guid userId,
        string productId,
        CancellationToken cancellationToken = default);

    Task<RecommendationAnalysisHistoryPageDto> GetChatbotAnalysisHistoryAsync(
        Guid userId,
        string productId,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);
}
