namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationAnalysisHistoryPageDto(
    IReadOnlyCollection<RecommendationAnalysisRecordDto> Items,
    int Total,
    int Page,
    int PageSize,
    bool HasMore);
