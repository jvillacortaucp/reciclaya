using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Dashboard.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Dashboard.Services;

public sealed class DashboardService(IAuthDbContext dbContext) : IDashboardService
{
    private const int WeeklySeriesDays = 7;
    private const int RecentActivityLimit = 6;

    public Task<DashboardSummaryDto> GetSummaryAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        return role.ToLowerInvariant() switch
        {
            "admin" => GetAdminSummaryAsync(cancellationToken),
            "seller" => GetSellerSummaryAsync(userId, cancellationToken),
            _ => GetBuyerSummaryAsync(cancellationToken)
        };
    }

    private async Task<DashboardSummaryDto> GetSellerSummaryAsync(
        Guid sellerId,
        CancellationToken cancellationToken)
    {
        var sellerListings = dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.SellerId == sellerId && listing.DeletedAt == null);

        var totalListings = await sellerListings.CountAsync(cancellationToken);
        var publishedListings = await sellerListings.CountAsync(
            listing => listing.Status == ListingStatus.Published,
            cancellationToken);
        var draftListings = await sellerListings.CountAsync(
            listing => listing.Status == ListingStatus.Draft,
            cancellationToken);
        var estimatedPublishedValue = await sellerListings
            .Where(listing => listing.Status == ListingStatus.Published)
            .SumAsync(
                listing => listing.PricePerUnitUsd.HasValue
                    ? listing.PricePerUnitUsd.Value * listing.Quantity
                    : 0m,
                cancellationToken);

        var series = await BuildWeeklyListingSeriesAsync(sellerListings, cancellationToken);
        var recentListings = await sellerListings
            .OrderByDescending(listing => listing.UpdatedAt)
            .Take(RecentActivityLimit)
            .Select(listing => new
            {
                listing.Id,
                listing.SpecificResidue,
                listing.Status,
                listing.Quantity,
                listing.Unit,
                listing.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto(
            [
                new("totalListings", "Total publicaciones", totalListings.ToString(CultureInfo.InvariantCulture)),
                new("publishedListings", "Publicadas", publishedListings.ToString(CultureInfo.InvariantCulture)),
                new("draftListings", "Borradores", draftListings.ToString(CultureInfo.InvariantCulture)),
                new("estimatedPublishedValue", "Valor publicado estimado", FormatCurrency(estimatedPublishedValue))
            ],
            series,
            recentListings
                .Select(listing => new DashboardActivityDto(
                    listing.Id.ToString(),
                    "listing",
                    listing.SpecificResidue,
                    $"{ToListingStatusLabel(listing.Status)} - {listing.Quantity} {listing.Unit}",
                    ToDateTimeOffset(listing.UpdatedAt)))
                .ToArray());
    }

    private async Task<DashboardSummaryDto> GetBuyerSummaryAsync(CancellationToken cancellationToken)
    {
        var publishedListings = dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Published && listing.DeletedAt == null);

        var totalAvailableListings = await publishedListings.CountAsync(cancellationToken);
        var recentCount = await publishedListings
            .CountAsync(
                listing => (listing.PublishedAt ?? listing.CreatedAt) >= DateTime.UtcNow.AddDays(-7),
                cancellationToken);
        var basicOpportunities = await publishedListings
            .CountAsync(listing => listing.MatchScore == null || listing.MatchScore >= 70, cancellationToken);

        var series = await BuildWeeklyListingSeriesAsync(publishedListings, cancellationToken);
        var recentListings = await publishedListings
            .OrderByDescending(listing => listing.PublishedAt ?? listing.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(listing => new
            {
                listing.Id,
                listing.SpecificResidue,
                listing.Sector,
                listing.Location,
                OccurredAt = listing.PublishedAt ?? listing.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto(
            [
                new("availableListings", "Publicaciones disponibles", totalAvailableListings.ToString(CultureInfo.InvariantCulture)),
                new("recentListings", "Publicaciones recientes", recentCount.ToString(CultureInfo.InvariantCulture), "Ultimos 7 dias"),
                new("basicOpportunities", "Oportunidades recomendadas", basicOpportunities.ToString(CultureInfo.InvariantCulture))
            ],
            series,
            recentListings
                .Select(listing => new DashboardActivityDto(
                    listing.Id.ToString(),
                    "marketplace",
                    listing.SpecificResidue,
                    $"{listing.Sector} - {listing.Location}",
                    ToDateTimeOffset(listing.OccurredAt)))
                .ToArray());
    }

    private async Task<DashboardSummaryDto> GetAdminSummaryAsync(CancellationToken cancellationToken)
    {
        var totalUsers = await dbContext.Users.AsNoTracking().CountAsync(cancellationToken);
        var totalCompanies = await dbContext.Companies.AsNoTracking().CountAsync(cancellationToken);
        var pendingCompanies = await dbContext.Companies
            .AsNoTracking()
            .CountAsync(company => company.VerificationStatus == VerificationStatus.Pending, cancellationToken);
        var verifiedCompanies = await dbContext.Companies
            .AsNoTracking()
            .CountAsync(company => company.VerificationStatus == VerificationStatus.Verified, cancellationToken);
        var publishedListings = await dbContext.Listings
            .AsNoTracking()
            .CountAsync(
                listing => listing.Status == ListingStatus.Published && listing.DeletedAt == null,
                cancellationToken);

        var series = await BuildWeeklyListingSeriesAsync(
            dbContext.Listings
                .AsNoTracking()
                .Where(listing => listing.Status == ListingStatus.Published && listing.DeletedAt == null),
            cancellationToken);

        var recentUsers = await dbContext.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(user => new DashboardActivityDto(
                user.Id.ToString(),
                "user",
                user.FullName,
                user.Email,
                user.CreatedAt))
            .ToListAsync(cancellationToken);

        var recentCompanies = await dbContext.Companies
            .AsNoTracking()
            .OrderByDescending(company => company.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(company => new DashboardActivityDto(
                company.Id.ToString(),
                "company",
                company.BusinessName,
                $"{company.Ruc} - {company.VerificationStatus}",
                company.CreatedAt))
            .ToListAsync(cancellationToken);

        var recentListings = await dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.DeletedAt == null)
            .OrderByDescending(listing => listing.UpdatedAt)
            .Take(RecentActivityLimit)
            .Select(listing => new
            {
                listing.Id,
                listing.SpecificResidue,
                listing.Status,
                listing.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        var activity = recentUsers
            .Concat(recentCompanies)
            .Concat(recentListings.Select(listing => new DashboardActivityDto(
                listing.Id.ToString(),
                "listing",
                listing.SpecificResidue,
                ToListingStatusLabel(listing.Status),
                ToDateTimeOffset(listing.UpdatedAt))))
            .OrderByDescending(activity => activity.OccurredAt)
            .Take(RecentActivityLimit)
            .ToArray();

        return new DashboardSummaryDto(
            [
                new("totalUsers", "Total usuarios", totalUsers.ToString(CultureInfo.InvariantCulture)),
                new("totalCompanies", "Total empresas", totalCompanies.ToString(CultureInfo.InvariantCulture)),
                new("pendingCompanies", "Empresas pendientes", pendingCompanies.ToString(CultureInfo.InvariantCulture)),
                new("verifiedCompanies", "Empresas verificadas", verifiedCompanies.ToString(CultureInfo.InvariantCulture)),
                new("publishedListings", "Publicaciones activas", publishedListings.ToString(CultureInfo.InvariantCulture))
            ],
            series,
            activity);
    }

    private static async Task<IReadOnlyCollection<DashboardSeriesPointDto>> BuildWeeklyListingSeriesAsync(
        IQueryable<Listing> query,
        CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var startDate = today.AddDays(-(WeeklySeriesDays - 1));
        var rows = await query
            .Where(listing => (listing.PublishedAt ?? listing.CreatedAt) >= startDate)
            .Select(listing => listing.PublishedAt ?? listing.CreatedAt)
            .ToListAsync(cancellationToken);

        return Enumerable.Range(0, WeeklySeriesDays)
            .Select(offset =>
            {
                var date = startDate.AddDays(offset);
                var count = rows.Count(publishedAt => publishedAt.Date == date);

                return new DashboardSeriesPointDto(
                    ToDayLabel(date),
                    date,
                    count);
            })
            .ToArray();
    }

    private static string ToListingStatusLabel(ListingStatus status)
    {
        return status switch
        {
            ListingStatus.Published => "Publicado",
            ListingStatus.Draft => "Borrador",
            ListingStatus.Paused => "Pausado",
            ListingStatus.Sold => "Vendido",
            ListingStatus.Expired => "Expirado",
            ListingStatus.Archived => "Archivado",
            _ => status.ToString()
        };
    }

    private static string ToDayLabel(DateTime date)
    {
        return CultureInfo.GetCultureInfo("es-PE")
            .DateTimeFormat
            .GetAbbreviatedDayName(date.DayOfWeek);
    }

    private static string FormatCurrency(decimal value)
    {
        return $"USD {value:N2}";
    }

    private static DateTimeOffset ToDateTimeOffset(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Unspecified
            ? new DateTimeOffset(DateTime.SpecifyKind(dateTime, DateTimeKind.Utc))
            : new DateTimeOffset(dateTime.ToUniversalTime());
    }
}
