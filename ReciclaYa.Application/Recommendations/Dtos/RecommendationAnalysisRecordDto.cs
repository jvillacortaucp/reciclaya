using ReciclaYa.Application.ValueSectors.Dtos;

namespace ReciclaYa.Application.Recommendations.Dtos;

public sealed record RecommendationAnalysisRecordDto(
    Guid AnalysisId,
    Guid? ListingId,
    string? SelectedProductId,
    string AnalysisOrigin,
    Guid UserId,
    string? ChatbotProductId,
    string? ChatbotProductName,
    string? ChatbotResidueInput,
    string? ChatbotSectorName,
    string Source,
    string Status,
    decimal CoveragePercent,
    bool ProcessOk,
    bool ExplanationOk,
    bool MarketOk,
    string? ErrorCode,
    DateTime CreatedAt,
    ValueRouteDetailDto Data);
