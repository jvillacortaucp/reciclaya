using System.Globalization;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Models;

namespace ReciclaYa.Application.Listings.Mapping;

public static class ListingMapper
{
    public static ListingModel ToDomain(WasteSellRequestDto request)
    {
        var formValue = request.FormValue;

        return new ListingModel
        {
            ProductType = formValue.ProductType,
            SpecificResidue = formValue.SpecificResidue,
            SpecificResidueType = formValue.SpecificResidue,
            WasteType = formValue.ResidueType,
            Sector = formValue.Sector,
            Status = "draft",
            Description = formValue.ShortDescription,
            Condition = formValue.Additional.Condition,
            Restrictions = formValue.Additional.RestrictionsNotes,
            Quantity = formValue.Volume.Quantity,
            Unit = formValue.Volume.Unit,
            GenerationFrequency = formValue.Volume.GenerationFrequency,
            Currency = "USD",
            PricePerUnitUsd = formValue.Volume.EstimatedCostPerUnit,
            Location = formValue.Logistics.WarehouseAddress,
            MaxStorageTime = formValue.Logistics.MaxStorageTime,
            ExchangeType = formValue.Logistics.ExchangeType,
            DeliveryMode = formValue.Logistics.DeliveryMode,
            ImmediateAvailability = formValue.Logistics.ImmediateAvailability,
            NextAvailabilityDate = formValue.Additional.NextAvailabilityDate,
            DraftSavedAt = request.DraftSavedAt,
            AiSuggestionNote = request.AiSuggestionNote ?? string.Empty,
            Media = formValue.MediaUploads.Select(ToDomainMedia).ToArray()
        };
    }

    public static WasteSellResponseDto ToWasteSellResponse(ListingModel listing)
    {
        return new WasteSellResponseDto(
            new WasteListingFormValueDto(
                listing.WasteType,
                listing.Sector,
                listing.ProductType,
                listing.SpecificResidue,
                listing.Description,
                new WasteVolumeDto(
                    listing.Quantity,
                    listing.Unit,
                    listing.GenerationFrequency,
                    listing.PricePerUnitUsd ?? 0),
                new WasteLogisticsDto(
                    listing.Location,
                    listing.MaxStorageTime,
                    listing.ExchangeType,
                    listing.DeliveryMode,
                    listing.ImmediateAvailability),
                new WasteAdditionalDto(
                    listing.Condition,
                    listing.Restrictions,
                    listing.NextAvailabilityDate),
                listing.Media.Select(ToWasteMediaUpload).ToArray()),
            listing.DraftSavedAt,
            listing.AiSuggestionNote);
    }

    public static MarketplaceListingDto ToMarketplaceListingDto(ListingModel listing)
    {
        return new MarketplaceListingDto(
            listing.Id,
            listing.ProductType,
            listing.SpecificResidue,
            listing.WasteType,
            listing.Sector,
            listing.Quantity,
            listing.Unit,
            listing.Location,
            listing.ExchangeType,
            listing.DeliveryMode,
            listing.ImmediateAvailability,
            listing.Condition,
            listing.PricePerUnitUsd,
            ToMarketplaceStatus(listing.Status),
            listing.MatchScore,
            listing.CreatedAt.ToString("O", CultureInfo.InvariantCulture),
            listing.Media.Select(ToMediaDto).ToArray());
    }

    public static ListingDetailDto ToListingDetailDto(
        ListingModel listing,
        IReadOnlyCollection<ListingModel>? relatedListings = null)
    {
        var costPerUnit = listing.PricePerUnitUsd ?? 0;

        return new ListingDetailDto(
            listing.Id,
            listing.ReferenceCode,
            ResolveTitle(listing),
            listing.Subtitle,
            listing.ProductType,
            string.IsNullOrWhiteSpace(listing.SpecificResidueType)
                ? listing.SpecificResidue
                : listing.SpecificResidueType,
            listing.WasteType,
            listing.Sector,
            ToMarketplaceStatus(listing.Status),
            listing.Description,
            listing.Condition,
            listing.Restrictions,
            listing.SellerName,
            listing.SellerVerificationLabel,
            listing.Media.Select(ToMediaDto).ToArray(),
            new ListingDetailVolumeDto(
                listing.Quantity,
                listing.Unit,
                listing.GenerationFrequency),
            new ListingDetailPricingDto(
                listing.Currency,
                costPerUnit,
                listing.Quantity * costPerUnit,
                listing.Negotiable || listing.PricePerUnitUsd is null),
            new ListingDetailLogisticsDto(
                listing.Location,
                listing.DeliveryMode,
                listing.ExchangeType,
                listing.ImmediateAvailability,
                listing.MaxStorageTime,
                listing.LogisticsNotes),
            listing.TechnicalSpecs.Select(ToTechnicalSpecDto).ToArray(),
            (relatedListings ?? Array.Empty<ListingModel>())
                .Select(ToRelatedListingPreviewDto)
                .ToArray());
    }

    public static ListingPreviewDto ToListingPreviewDto(ListingModel listing)
    {
        var total = listing.Quantity * (listing.PricePerUnitUsd ?? 0);

        return new ListingPreviewDto(
            ResolveTitle(listing),
            listing.WasteType == "organic" ? "ORGANICO" : "INORGANICO",
            listing.Sector,
            $"{listing.Quantity} {listing.Unit}",
            $"${total:0.00} USD",
            string.IsNullOrWhiteSpace(listing.Location) ? "Ubicacion pendiente" : listing.Location,
            listing.ImmediateAvailability ? "Disponible hoy" : "Disponibilidad programada",
            "BORRADOR",
            0);
    }

    private static ListingMediaModel ToDomainMedia(WasteMediaUploadDto media)
    {
        return new ListingMediaModel
        {
            Id = media.Id,
            Url = media.PreviewUrl,
            Alt = media.Name,
            Name = media.Name,
            SizeKb = media.SizeKb,
            Type = media.Type
        };
    }

    private static WasteMediaUploadDto ToWasteMediaUpload(ListingMediaModel media)
    {
        return new WasteMediaUploadDto(
            media.Id,
            media.Name,
            media.Url,
            media.SizeKb,
            media.Type);
    }

    private static ListingMediaDto ToMediaDto(ListingMediaModel media)
    {
        return new ListingMediaDto(media.Id, media.Url, media.Alt);
    }

    private static ListingTechnicalSpecDto ToTechnicalSpecDto(ListingTechnicalSpecModel technicalSpec)
    {
        return new ListingTechnicalSpecDto(technicalSpec.Key, technicalSpec.Label, technicalSpec.Value);
    }

    private static RelatedListingPreviewDto ToRelatedListingPreviewDto(ListingModel listing)
    {
        return new RelatedListingPreviewDto(
            listing.Id,
            ResolveTitle(listing),
            listing.Location,
            $"{listing.Quantity} {listing.Unit}",
            ToPriceLabel(listing),
            listing.Media.FirstOrDefault()?.Url ?? string.Empty);
    }

    private static string ResolveTitle(ListingModel listing)
    {
        return string.IsNullOrWhiteSpace(listing.Title)
            ? listing.SpecificResidue
            : listing.Title;
    }

    private static string ToMarketplaceStatus(string status)
    {
        return string.Equals(status, "recent", StringComparison.OrdinalIgnoreCase)
            ? "recent"
            : "available";
    }

    private static string ToPriceLabel(ListingModel listing)
    {
        if (listing.ExchangeType == "pickup" || listing.PricePerUnitUsd == 0)
        {
            return "Gratis";
        }

        if (listing.ExchangeType == "barter" || listing.PricePerUnitUsd is null)
        {
            return "Canjeable";
        }

        return $"${listing.PricePerUnitUsd:0.##} / {listing.Unit}";
    }
}
