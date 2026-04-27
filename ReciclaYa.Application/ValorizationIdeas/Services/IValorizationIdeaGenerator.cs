using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.ValorizationIdeas.Services;

public interface IValorizationIdeaGenerator
{
    Task<IReadOnlyCollection<GeneratedValorizationIdea>> GenerateAsync(
        Listing listing,
        CancellationToken cancellationToken = default);
}

public sealed record GeneratedValorizationIdea(
    string Title,
    string Summary,
    string SuggestedProduct,
    string ProcessOverview,
    IReadOnlyCollection<string> PotentialBuyers,
    IReadOnlyCollection<string> RequiredConditions,
    string SellerRecommendation,
    string BuyerRecommendation,
    string RecommendedStrategy,
    string ViabilityLevel,
    string EstimatedImpact,
    IReadOnlyCollection<string> Warnings,
    string Source);
