using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.Listings.Mapping;
using ReciclaYa.Application.Listings.Models;
using ReciclaYa.Application.ValorizationIdeas.Dtos;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.ValorizationIdeas.Services;

public sealed class ValorizationIdeaService(
    IAuthDbContext dbContext,
    IValorizationIdeaGenerator valorizationIdeaGenerator) : IValorizationIdeaService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<IReadOnlyCollection<ValorizationIdeaDto>?> GetByListingAsync(
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listingExists = await dbContext.Listings
            .AsNoTracking()
            .AnyAsync(listing => listing.Id == listingId && listing.DeletedAt == null, cancellationToken);

        if (!listingExists)
        {
            return null;
        }

        var ideas = await dbContext.ValorizationIdeas
            .AsNoTracking()
            .Where(idea => idea.ListingId == listingId)
            .OrderBy(idea => idea.CreatedAt)
            .ToListAsync(cancellationToken);

        return ideas.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<ValorizationIdeaDto>?> GenerateAsync(
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .FirstOrDefaultAsync(
                item => item.Id == listingId && item.DeletedAt == null,
                cancellationToken);

        if (listing is null)
        {
            return null;
        }

        var generatedIdeas = await valorizationIdeaGenerator.GenerateAsync(listing, cancellationToken);
        var now = DateTime.UtcNow;

        var previousIdeas = await dbContext.ValorizationIdeas
            .Where(idea => idea.ListingId == listingId)
            .ToListAsync(cancellationToken);

        if (previousIdeas.Count > 0)
        {
            dbContext.ValorizationIdeas.RemoveRange(previousIdeas);
        }

        var ideas = generatedIdeas
            .Take(3)
            .Select(generated => new ValorizationIdea
            {
                Id = Guid.NewGuid(),
                ListingId = listingId,
                Title = generated.Title,
                Summary = generated.Summary,
                SuggestedProduct = generated.SuggestedProduct,
                ProcessOverview = generated.ProcessOverview,
                PotentialBuyers = SerializeCollection(generated.PotentialBuyers),
                RequiredConditions = SerializeCollection(generated.RequiredConditions),
                SellerRecommendation = generated.SellerRecommendation,
                BuyerRecommendation = generated.BuyerRecommendation,
                RecommendedStrategy = generated.RecommendedStrategy,
                ViabilityLevel = generated.ViabilityLevel,
                EstimatedImpact = generated.EstimatedImpact,
                Warnings = SerializeCollection(generated.Warnings),
                Source = generated.Source,
                CreatedAt = now,
                UpdatedAt = now
            })
            .ToArray();

        dbContext.ValorizationIdeas.AddRange(ideas);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ideas.Select(ToDto).ToArray();
    }

    public async Task<IReadOnlyCollection<ValorizationIdeaDto>> PreviewAsync(
        WasteSellRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var listing = ToTransientListing(ListingMapper.ToDomain(request));
        var generatedIdeas = await valorizationIdeaGenerator.GenerateAsync(listing, cancellationToken);

        return generatedIdeas
            .Take(3)
            .Select(generated => new ValorizationIdeaDto(
                null,
                generated.Title,
                generated.Summary,
                generated.SuggestedProduct,
                generated.ProcessOverview,
                generated.PotentialBuyers,
                generated.RequiredConditions,
                generated.SellerRecommendation,
                generated.BuyerRecommendation,
                generated.RecommendedStrategy,
                generated.ViabilityLevel,
                generated.EstimatedImpact,
                generated.Warnings,
                generated.Source))
            .ToArray();
    }

    private static ValorizationIdeaDto ToDto(ValorizationIdea idea)
    {
        return new ValorizationIdeaDto(
            idea.Id,
            idea.Title,
            idea.Summary,
            idea.SuggestedProduct,
            idea.ProcessOverview,
            DeserializeCollection(idea.PotentialBuyers),
            DeserializeCollection(idea.RequiredConditions),
            idea.SellerRecommendation,
            idea.BuyerRecommendation,
            idea.RecommendedStrategy,
            idea.ViabilityLevel,
            idea.EstimatedImpact,
            DeserializeCollection(idea.Warnings),
            idea.Source);
    }

    private static Listing ToTransientListing(ListingModel model)
    {
        return new Listing
        {
            Id = Guid.Empty,
            SellerId = Guid.Empty,
            ReferenceCode = string.Empty,
            WasteType = model.WasteType,
            Sector = model.Sector,
            ProductType = model.ProductType,
            SpecificResidue = model.SpecificResidue,
            Description = model.Description,
            Quantity = model.Quantity,
            Unit = model.Unit,
            GenerationFrequency = model.GenerationFrequency,
            PricePerUnitUsd = model.PricePerUnitUsd,
            Currency = string.IsNullOrWhiteSpace(model.Currency) ? "USD" : model.Currency,
            Location = model.Location,
            MaxStorageTime = string.IsNullOrWhiteSpace(model.MaxStorageTime) ? null : model.MaxStorageTime,
            ExchangeType = model.ExchangeType,
            DeliveryMode = model.DeliveryMode,
            ImmediateAvailability = model.ImmediateAvailability,
            Condition = model.Condition,
            Restrictions = string.IsNullOrWhiteSpace(model.Restrictions) ? null : model.Restrictions,
            NextAvailabilityDate = ParsePreviewDate(model.NextAvailabilityDate),
            AiSuggestionNote = string.IsNullOrWhiteSpace(model.AiSuggestionNote) ? null : model.AiSuggestionNote,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private static DateTime? ParsePreviewDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (!DateTime.TryParse(value, out var parsed))
        {
            return null;
        }

        return parsed.Kind switch
        {
            DateTimeKind.Utc => parsed,
            DateTimeKind.Local => parsed.ToUniversalTime(),
            _ => DateTime.SpecifyKind(parsed, DateTimeKind.Utc)
        };
    }

    private static string SerializeCollection(IReadOnlyCollection<string> values)
    {
        return JsonSerializer.Serialize(
            values
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Select(value => value.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray(),
            JsonOptions);
    }

    private static IReadOnlyCollection<string> DeserializeCollection(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Array.Empty<string>();
        }

        try
        {
            var items = JsonSerializer.Deserialize<string[]>(value, JsonOptions);
            return items?
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Select(item => item.Trim())
                .ToArray()
                ?? Array.Empty<string>();
        }
        catch (JsonException)
        {
            return Array.Empty<string>();
        }
    }
}
