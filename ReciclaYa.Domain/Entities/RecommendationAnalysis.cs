namespace ReciclaYa.Domain.Entities;

public sealed class RecommendationAnalysis
{
    public Guid Id { get; set; }

    public Guid? ListingId { get; set; }

    public string? SelectedProductId { get; set; }

    public string AnalysisOrigin { get; set; } = "listing";

    public Guid UserId { get; set; }

    public string? ChatbotProductId { get; set; }

    public string? ChatbotProductName { get; set; }

    public string? ChatbotResidueInput { get; set; }

    public string? ChatbotSectorName { get; set; }

    public string Source { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string PayloadJson { get; set; } = "{}";

    public decimal CoveragePercent { get; set; }

    public bool ProcessOk { get; set; }

    public bool ExplanationOk { get; set; }

    public bool MarketOk { get; set; }

    public string? ErrorCode { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Listing? Listing { get; set; }
}
