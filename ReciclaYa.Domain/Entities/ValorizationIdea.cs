namespace ReciclaYa.Domain.Entities;

public sealed class ValorizationIdea
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string SuggestedProduct { get; set; } = string.Empty;

    public string ProcessOverview { get; set; } = string.Empty;

    public string PotentialBuyers { get; set; } = "[]";

    public string RequiredConditions { get; set; } = "[]";

    public string SellerRecommendation { get; set; } = string.Empty;

    public string BuyerRecommendation { get; set; } = string.Empty;

    public string RecommendedStrategy { get; set; } = string.Empty;

    public string ViabilityLevel { get; set; } = string.Empty;

    public string EstimatedImpact { get; set; } = string.Empty;

    public string Warnings { get; set; } = "[]";

    public string Source { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Listing Listing { get; set; } = null!;
}
