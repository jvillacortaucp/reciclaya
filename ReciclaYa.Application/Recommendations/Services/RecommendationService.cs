using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Recommendations.Services;

public sealed class RecommendationService(IAuthDbContext dbContext) : IRecommendationService
{
    private const int MaxRecommendations = 12;
    private const string ActiveStatus = "active";

    public async Task<IReadOnlyCollection<RecommendationDto>> GetRecommendationsAsync(
        Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        var preference = await GetCurrentPreferenceAsync(userId, cancellationToken);
        var listings = await GetPublishedListingsAsync(userId, cancellationToken);

        return listings
            .Select(listing => ToRecommendation(listing, preference))
            .OrderByDescending(recommendation => recommendation.ConfidenceScore)
            .ThenBy(recommendation => recommendation.Title)
            .Take(MaxRecommendations)
            .ToArray();
    }

    private async Task<PurchasePreference?> GetCurrentPreferenceAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await dbContext.PurchasePreferences
            .AsNoTracking()
            .Where(preference => preference.BuyerId == userId)
            .OrderByDescending(preference => preference.ProfileStatus == ActiveStatus)
            .ThenByDescending(preference => preference.UpdatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<IReadOnlyCollection<Listing>> GetPublishedListingsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Published
                && listing.DeletedAt == null
                && listing.SellerId != userId)
            .OrderByDescending(listing => listing.MatchScore ?? 0)
            .ThenByDescending(listing => listing.PublishedAt ?? listing.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    private static RecommendationDto ToRecommendation(
        Listing listing,
        PurchasePreference? preference)
    {
        var calculatedScore = preference is null
            ? CalculateGeneralScore(listing)
            : CalculatePreferenceScore(listing, preference);
        var finalScore = listing.MatchScore.HasValue
            ? (int)Math.Round((calculatedScore + listing.MatchScore.Value) / 2m, MidpointRounding.AwayFromZero)
            : calculatedScore;
        var confidenceScore = Math.Clamp(finalScore, 0, 100);

        return new RecommendationDto(
            $"rec-{listing.Id:N}",
            BuildTitle(listing),
            confidenceScore,
            BuildReason(confidenceScore, preference is not null),
            listing.Id);
    }

    private static int CalculatePreferenceScore(
        Listing listing,
        PurchasePreference preference)
    {
        var score = 0;

        score += Matches(listing.WasteType, preference.ResidueType) ? 35 : 0;
        score += Matches(listing.Sector, preference.Sector) ? 25 : 0;
        score += Matches(listing.ProductType, preference.ProductType) ? 20 : 0;
        score += Matches(listing.Condition, preference.DesiredCondition) ? 10 : 0;
        score += Matches(listing.ExchangeType, preference.AcceptedExchangeType) ? 10 : 0;
        score += listing.ImmediateAvailability ? 5 : 0;
        score += LocationMatches(listing.Location, preference.ReceivingLocation) ? 5 : 0;

        return Math.Clamp(score, 0, 100);
    }

    private static int CalculateGeneralScore(Listing listing)
    {
        var score = listing.MatchScore ?? 60;

        if (listing.ImmediateAvailability)
        {
            score += 5;
        }

        if (listing.PricePerUnitUsd.HasValue)
        {
            score += 5;
        }

        return Math.Clamp(score, 0, 100);
    }

    private static string BuildTitle(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.SpecificResidue))
        {
            return listing.SpecificResidue;
        }

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return listing.ProductType;
        }

        return $"Listing {listing.ReferenceCode}";
    }

    private static string BuildReason(int confidenceScore, bool hasPreference)
    {
        if (hasPreference && confidenceScore >= 90)
        {
            return "Alta coincidencia con tus preferencias de compra";
        }

        if (confidenceScore >= 70)
        {
            return hasPreference
                ? "Buena oportunidad según tu perfil de búsqueda"
                : "Buena oportunidad disponible en el marketplace";
        }

        return "Oportunidad disponible en el marketplace";
    }

    private static bool Matches(string? left, string? right)
    {
        return !string.IsNullOrWhiteSpace(left)
            && !string.IsNullOrWhiteSpace(right)
            && string.Equals(left.Trim(), right.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    private static bool LocationMatches(string? listingLocation, string? receivingLocation)
    {
        if (string.IsNullOrWhiteSpace(listingLocation) || string.IsNullOrWhiteSpace(receivingLocation))
        {
            return false;
        }

        return listingLocation.Contains(receivingLocation, StringComparison.OrdinalIgnoreCase)
            || receivingLocation.Contains(listingLocation, StringComparison.OrdinalIgnoreCase);
    }
}
