using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Mapping;
using ReciclaYa.Application.Listings.Models;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Listings.Services;

public sealed class ListingService(IAuthDbContext dbContext) : IListingService
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 12;
    private const int MaxPageSize = 50;

    public async Task<WasteSellResponseDto> SaveDraftAsync(
        Guid sellerId,
        WasteSellRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var listing = await GetCurrentDraftAsync(sellerId, cancellationToken);

        if (listing is null)
        {
            listing = new Listing
            {
                Id = Guid.NewGuid(),
                SellerId = sellerId,
                ReferenceCode = GenerateReferenceCode(now),
                CreatedAt = now
            };

            dbContext.Listings.Add(listing);
        }

        ApplyWasteSellRequest(listing, request, now);
        listing.Status = ListingStatus.Draft;
        listing.DraftSavedAt = now;
        listing.PublishedAt = null;
        listing.MatchScore = null;

        ReplaceMedia(listing, request, now);

        await dbContext.SaveChangesAsync(cancellationToken);

        return ListingMapper.ToWasteSellResponse(ToListingModel(listing));
    }

    public async Task PublishAsync(
        Guid sellerId,
        WasteSellRequestDto request,
        Guid? listingId = null,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var listing = listingId.HasValue
            ? await GetOwnedListingAsync(sellerId, listingId.Value, cancellationToken)
            : await GetCurrentDraftAsync(sellerId, cancellationToken);

        if (listing is null)
        {
            if (listingId.HasValue)
            {
                throw new InvalidOperationException("No se encontró la publicación a editar.");
            }

            listing = new Listing
            {
                Id = Guid.NewGuid(),
                SellerId = sellerId,
                ReferenceCode = GenerateReferenceCode(now),
                CreatedAt = now
            };

            dbContext.Listings.Add(listing);
        }

        ApplyWasteSellRequest(listing, request, now);
        listing.Status = ListingStatus.Published;
        listing.DraftSavedAt = EnsureUtc(listing.DraftSavedAt ?? now);
        listing.PublishedAt = now;

        ReplaceMedia(listing, request, now);
        listing.MatchScore = CalculateMatchScore(listing);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public ListingPreviewDto Preview(WasteSellRequestDto request)
    {
        var listing = ListingMapper.ToDomain(request);
        var preview = ListingMapper.ToListingPreviewDto(listing);

        return preview with
        {
            CompletionPercentage = CalculateCompletionPercentage(request)
        };
    }

    public async Task<MarketplaceListingsPageDto> GetMarketplaceListingsAsync(
        int page,
        int pageSize,
        string? queryText,
        string? sortBy,
        string? wasteType,
        string? sector,
        string? productType,
        string? specificResidue,
        string? exchangeType,
        string? location,
        decimal? minPrice,
        decimal? maxPrice,
        string? deliveryMode,
        bool? immediateOnly,
        string? residueCondition,
        CancellationToken cancellationToken = default)
    {
        var normalizedPage = page < 1 ? DefaultPage : page;
        var normalizedPageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var listingsQuery = dbContext.Listings
            .AsNoTracking()
            .Include(listing => listing.Media)
            .Where(listing => listing.Status == ListingStatus.Published && listing.DeletedAt == null);

        listingsQuery = ApplyFilters(
            listingsQuery,
            queryText,
            wasteType,
            sector,
            productType,
            specificResidue,
            exchangeType,
            location,
            minPrice,
            maxPrice,
            deliveryMode,
            immediateOnly,
            residueCondition);
        listingsQuery = ApplySorting(listingsQuery, sortBy);

        var total = await listingsQuery.CountAsync(cancellationToken);
        var items = await listingsQuery
            .Skip((normalizedPage - 1) * normalizedPageSize)
            .Take(normalizedPageSize)
            .ToListAsync(cancellationToken);

        return new MarketplaceListingsPageDto(
            items.Select(listing => ListingMapper.ToMarketplaceListingDto(ToListingModel(listing))).ToArray(),
            total,
            normalizedPage,
            normalizedPageSize,
            normalizedPage * normalizedPageSize < total);
    }

    public async Task<ListingDetailDto?> GetListingDetailAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .AsNoTracking()
            .AsSplitQuery()
            .Include(item => item.Seller)
                .ThenInclude(seller => seller.Company)
            .Include(item => item.Media)
            .Include(item => item.TechnicalSpecs)
            .FirstOrDefaultAsync(
                item => item.Id == id
                    && item.Status == ListingStatus.Published
                    && item.DeletedAt == null,
                cancellationToken);

        if (listing is null)
        {
            return null;
        }

        var relatedListings = await dbContext.Listings
            .AsNoTracking()
            .Include(item => item.Media)
            .Where(item => item.Id != id
                && item.Status == ListingStatus.Published
                && item.DeletedAt == null
                && (item.WasteType == listing.WasteType || item.Sector == listing.Sector))
            .OrderByDescending(item => item.PublishedAt ?? item.CreatedAt)
            .Take(3)
            .ToListAsync(cancellationToken);

        return ListingMapper.ToListingDetailDto(
            ToListingModel(listing),
            relatedListings.Select(ToListingModel).ToArray());
    }

    public async Task<IReadOnlyCollection<MarketplaceListingDto>> GetMyListingsAsync(
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        var listings = await dbContext.Listings
            .AsNoTracking()
            .Include(listing => listing.Media)
            .Where(listing => listing.SellerId == sellerId && listing.DeletedAt == null)
            .OrderByDescending(listing => listing.UpdatedAt)
            .ToListAsync(cancellationToken);

        return listings
            .Select(listing => ListingMapper.ToMarketplaceListingDto(ToListingModel(listing)))
            .ToArray();
    }

    public async Task<WasteSellResponseDto?> GetMyListingForEditAsync(
        Guid sellerId,
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listing = await GetOwnedListingAsync(sellerId, listingId, cancellationToken);
        if (listing is null || listing.DeletedAt is not null)
        {
            return null;
        }

        return ListingMapper.ToWasteSellResponse(ToListingModel(listing));
    }

    public async Task<bool> CancelMyListingAsync(
        Guid sellerId,
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .FirstOrDefaultAsync(
                item => item.Id == listingId
                    && item.SellerId == sellerId
                    && item.DeletedAt == null,
                cancellationToken);

        if (listing is null)
        {
            return false;
        }

        listing.Status = ListingStatus.Archived;
        listing.MatchScore = null;
        listing.PublishedAt = null;
        listing.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<Listing?> GetCurrentDraftAsync(Guid sellerId, CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .AsSplitQuery()
            .Include(listing => listing.Media)
            .Include(listing => listing.TechnicalSpecs)
            .Where(listing => listing.SellerId == sellerId
                && listing.Status == ListingStatus.Draft
                && listing.DeletedAt == null)
            .OrderByDescending(listing => listing.UpdatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static void ApplyWasteSellRequest(Listing listing, WasteSellRequestDto request, DateTime now)
    {
        var model = ListingMapper.ToDomain(request);

        listing.WasteType = model.WasteType;
        listing.Sector = model.Sector;
        listing.ProductType = model.ProductType;
        listing.SpecificResidue = model.SpecificResidue;
        listing.Description = model.Description;
        listing.Quantity = model.Quantity;
        listing.Unit = model.Unit;
        listing.GenerationFrequency = model.GenerationFrequency;
        listing.PricePerUnitUsd = model.PricePerUnitUsd;
        listing.Currency = string.IsNullOrWhiteSpace(model.Currency) ? "USD" : model.Currency;
        listing.Location = model.Location;
        listing.MaxStorageTime = EmptyToNull(model.MaxStorageTime);
        listing.ExchangeType = model.ExchangeType;
        listing.DeliveryMode = model.DeliveryMode;
        listing.ImmediateAvailability = model.ImmediateAvailability;
        listing.Condition = model.Condition;
        listing.Restrictions = EmptyToNull(model.Restrictions);
        listing.NextAvailabilityDate = ParseDate(model.NextAvailabilityDate);
        listing.AiSuggestionNote = model.AiSuggestionNote;
        listing.UpdatedAt = now;
    }

    private void ReplaceMedia(Listing listing, WasteSellRequestDto request, DateTime now)
    {
        if (listing.Media.Count > 0)
        {
            dbContext.ListingMedia.RemoveRange(listing.Media);
            listing.Media.Clear();
        }

        var sortOrder = 0;
        foreach (var media in request.FormValue.MediaUploads)
        {
            listing.Media.Add(new ListingMedia
            {
                Id = Guid.TryParse(media.Id, out var mediaId) ? mediaId : Guid.NewGuid(),
                ListingId = listing.Id,
                Url = media.PreviewUrl,
                Alt = media.Name,
                Name = media.Name,
                SizeKb = media.SizeKb,
                Type = media.Type,
                SortOrder = sortOrder++,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    private static IQueryable<Listing> ApplyFilters(
        IQueryable<Listing> query,
        string? queryText,
        string? wasteType,
        string? sector,
        string? productType,
        string? specificResidue,
        string? exchangeType,
        string? location,
        decimal? minPrice,
        decimal? maxPrice,
        string? deliveryMode,
        bool? immediateOnly,
        string? residueCondition)
    {
        if (!string.IsNullOrWhiteSpace(queryText))
        {
            var normalizedQuery = queryText.Trim().ToLower();
            query = query.Where(listing =>
                listing.SpecificResidue.ToLower().Contains(normalizedQuery)
                || listing.Location.ToLower().Contains(normalizedQuery)
                || listing.Sector.ToLower().Contains(normalizedQuery)
                || listing.ProductType.ToLower().Contains(normalizedQuery));
        }

        if (!IsAllOrEmpty(wasteType))
        {
            query = query.Where(listing => listing.WasteType == wasteType);
        }

        if (!IsAllOrEmpty(sector))
        {
            query = query.Where(listing => listing.Sector == sector);
        }

        if (!IsAllOrEmpty(productType))
        {
            query = query.Where(listing => listing.ProductType == productType);
        }

        if (!string.IsNullOrWhiteSpace(specificResidue))
        {
            var normalizedSpecificResidue = specificResidue.Trim().ToLower();
            query = query.Where(listing => listing.SpecificResidue.ToLower().Contains(normalizedSpecificResidue));
        }

        if (!IsAllOrEmpty(exchangeType))
        {
            query = query.Where(listing => listing.ExchangeType == exchangeType);
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            var normalizedLocation = location.Trim().ToLower();
            query = query.Where(listing => listing.Location.ToLower().Contains(normalizedLocation));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(listing => listing.PricePerUnitUsd.HasValue && listing.PricePerUnitUsd.Value >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(listing => listing.PricePerUnitUsd.HasValue && listing.PricePerUnitUsd.Value <= maxPrice.Value);
        }

        if (!IsAllOrEmpty(deliveryMode))
        {
            query = query.Where(listing => listing.DeliveryMode == deliveryMode);
        }

        if (immediateOnly == true)
        {
            query = query.Where(listing => listing.ImmediateAvailability);
        }

        if (!IsAllOrEmpty(residueCondition))
        {
            query = query.Where(listing => listing.Condition == residueCondition);
        }

        return query;
    }

    private static IQueryable<Listing> ApplySorting(IQueryable<Listing> query, string? sortBy)
    {
        return sortBy?.Trim().ToLowerInvariant() switch
        {
            "best_match" => query.OrderByDescending(listing => listing.MatchScore ?? 0)
                .ThenByDescending(listing => listing.PublishedAt ?? listing.CreatedAt),
            "lowest_price" => query.OrderBy(listing => listing.PricePerUnitUsd ?? decimal.MaxValue)
                .ThenByDescending(listing => listing.PublishedAt ?? listing.CreatedAt),
            "highest_volume" => query.OrderByDescending(listing => listing.Quantity)
                .ThenByDescending(listing => listing.PublishedAt ?? listing.CreatedAt),
            _ => query.OrderByDescending(listing => listing.PublishedAt ?? listing.CreatedAt)
        };
    }

    private static ListingModel ToListingModel(Listing listing)
    {
        return new ListingModel
        {
            Id = listing.Id.ToString(),
            ReferenceCode = listing.ReferenceCode,
            Title = listing.SpecificResidue,
            Subtitle = listing.ReferenceCode,
            ProductType = listing.ProductType,
            SpecificResidue = listing.SpecificResidue,
            SpecificResidueType = listing.SpecificResidue,
            WasteType = listing.WasteType,
            Sector = listing.Sector,
            Status = ToApplicationStatus(listing),
            Description = listing.Description,
            Condition = listing.Condition,
            Restrictions = listing.Restrictions ?? string.Empty,
            SellerName = listing.Seller?.FullName ?? string.Empty,
            SellerVerificationLabel = ToSellerVerificationLabel(listing.Seller),
            Quantity = listing.Quantity,
            Unit = listing.Unit,
            GenerationFrequency = listing.GenerationFrequency,
            Currency = listing.Currency,
            PricePerUnitUsd = listing.PricePerUnitUsd,
            Negotiable = listing.PricePerUnitUsd is null,
            Location = listing.Location,
            DeliveryMode = listing.DeliveryMode,
            ExchangeType = listing.ExchangeType,
            ImmediateAvailability = listing.ImmediateAvailability,
            MaxStorageTime = listing.MaxStorageTime ?? string.Empty,
            LogisticsNotes = string.Empty,
            NextAvailabilityDate = listing.NextAvailabilityDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty,
            MatchScore = listing.MatchScore ?? 0,
            CreatedAt = ToDateTimeOffset(listing.CreatedAt),
            UpdatedAt = ToDateTimeOffset(listing.UpdatedAt),
            DraftSavedAt = listing.DraftSavedAt?.ToString("O", CultureInfo.InvariantCulture),
            AiSuggestionNote = listing.AiSuggestionNote ?? string.Empty,
            Media = listing.Media
                .OrderBy(media => media.SortOrder)
                .Select(ToListingMediaModel)
                .ToArray(),
            TechnicalSpecs = listing.TechnicalSpecs
                .Select(ToListingTechnicalSpecModel)
                .ToArray()
        };
    }

    private static ListingMediaModel ToListingMediaModel(ListingMedia media)
    {
        return new ListingMediaModel
        {
            Id = media.Id.ToString(),
            Url = media.Url,
            Alt = media.Alt ?? media.Name ?? string.Empty,
            Name = media.Name ?? string.Empty,
            SizeKb = decimal.ToInt32(media.SizeKb ?? 0),
            Type = media.Type ?? string.Empty
        };
    }

    private static ListingTechnicalSpecModel ToListingTechnicalSpecModel(ListingTechnicalSpec technicalSpec)
    {
        return new ListingTechnicalSpecModel
        {
            Key = technicalSpec.Key,
            Label = technicalSpec.Label,
            Value = technicalSpec.Value
        };
    }

    private static string ToApplicationStatus(Listing listing)
    {
        if (listing.Status is ListingStatus.Archived or ListingStatus.Paused or ListingStatus.Sold or ListingStatus.Expired)
        {
            return "inactive";
        }

        if (listing.Status == ListingStatus.Published
            && (listing.PublishedAt ?? listing.CreatedAt) >= DateTime.UtcNow.AddDays(-3))
        {
            return "recent";
        }

        return listing.Status == ListingStatus.Published ? "available" : "draft";
    }

    private async Task<Listing?> GetOwnedListingAsync(
        Guid sellerId,
        Guid listingId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .AsSplitQuery()
            .Include(listing => listing.Media)
            .Include(listing => listing.TechnicalSpecs)
            .FirstOrDefaultAsync(
                listing => listing.Id == listingId
                    && listing.SellerId == sellerId
                    && listing.DeletedAt == null,
                cancellationToken);
    }

    private static string ToSellerVerificationLabel(User? seller)
    {
        return seller?.Company?.VerificationStatus == VerificationStatus.Verified
            ? "Empresa verificada"
            : "Verificacion pendiente";
    }

    private static int CalculateMatchScore(Listing listing)
    {
        var score = 45;

        if (listing.Quantity > 0)
        {
            score += 10;
        }

        if (!string.IsNullOrWhiteSpace(listing.Description))
        {
            score += 10;
        }

        if (!string.IsNullOrWhiteSpace(listing.Location))
        {
            score += 10;
        }

        if (listing.Media.Count > 0)
        {
            score += 10;
        }

        if (listing.PricePerUnitUsd is not null)
        {
            score += 10;
        }

        if (listing.ImmediateAvailability)
        {
            score += 5;
        }

        return Math.Min(score, 100);
    }

    private static int CalculateCompletionPercentage(WasteSellRequestDto request)
    {
        var formValue = request.FormValue;
        var completed = 0;
        const int total = 12;

        completed += HasValue(formValue.ResidueType) ? 1 : 0;
        completed += HasValue(formValue.Sector) ? 1 : 0;
        completed += HasValue(formValue.ProductType) ? 1 : 0;
        completed += HasValue(formValue.SpecificResidue) ? 1 : 0;
        completed += HasValue(formValue.ShortDescription) ? 1 : 0;
        completed += formValue.Volume.Quantity > 0 ? 1 : 0;
        completed += HasValue(formValue.Volume.Unit) ? 1 : 0;
        completed += HasValue(formValue.Volume.GenerationFrequency) ? 1 : 0;
        completed += HasValue(formValue.Logistics.WarehouseAddress) ? 1 : 0;
        completed += HasValue(formValue.Logistics.ExchangeType) ? 1 : 0;
        completed += HasValue(formValue.Logistics.DeliveryMode) ? 1 : 0;
        completed += HasValue(formValue.Additional.Condition) ? 1 : 0;

        return (int)Math.Round(completed * 100m / total, MidpointRounding.AwayFromZero);
    }

    private static string GenerateReferenceCode(DateTime now)
    {
        return $"RY-{now:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    }

    private static DateTimeOffset ToDateTimeOffset(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Unspecified
            ? new DateTimeOffset(DateTime.SpecifyKind(dateTime, DateTimeKind.Utc))
            : new DateTimeOffset(dateTime.ToUniversalTime());
    }

    private static DateTime? ParseDate(string? value)
    {
        if (!DateTime.TryParse(
            value,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
            out var date))
        {
            return null;
        }

        return EnsureUtc(date);
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    private static string? EmptyToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    private static bool HasValue(string? value)
    {
        return !string.IsNullOrWhiteSpace(value);
    }

    private static bool IsAllOrEmpty(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            || string.Equals(value, "all", StringComparison.OrdinalIgnoreCase);
    }
}
