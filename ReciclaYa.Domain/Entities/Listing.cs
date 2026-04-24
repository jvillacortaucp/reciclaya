using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class Listing
{
    public Guid Id { get; set; }

    public Guid SellerId { get; set; }

    public string ReferenceCode { get; set; } = string.Empty;

    public string WasteType { get; set; } = string.Empty;

    public string Sector { get; set; } = string.Empty;

    public string ProductType { get; set; } = string.Empty;

    public string SpecificResidue { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public string Unit { get; set; } = string.Empty;

    public string GenerationFrequency { get; set; } = string.Empty;

    public decimal? PricePerUnitUsd { get; set; }

    public string Currency { get; set; } = "USD";

    public string Location { get; set; } = string.Empty;

    public string? MaxStorageTime { get; set; }

    public string ExchangeType { get; set; } = string.Empty;

    public string DeliveryMode { get; set; } = string.Empty;

    public bool ImmediateAvailability { get; set; }

    public string Condition { get; set; } = string.Empty;

    public string? Restrictions { get; set; }

    public DateTime? NextAvailabilityDate { get; set; }

    public ListingStatus Status { get; set; } = ListingStatus.Draft;

    public int? MatchScore { get; set; }

    public string? AiSuggestionNote { get; set; }

    public DateTime? DraftSavedAt { get; set; }

    public DateTime? PublishedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public User Seller { get; set; } = null!;

    public ICollection<ListingMedia> Media { get; set; } = new List<ListingMedia>();

    public ICollection<ListingTechnicalSpec> TechnicalSpecs { get; set; } = new List<ListingTechnicalSpec>();

    public ICollection<PreOrder> PreOrders { get; set; } = new List<PreOrder>();

    public ICollection<CommercialRequest> CommercialRequests { get; set; } = new List<CommercialRequest>();

    public ICollection<MessageThread> MessageThreads { get; set; } = new List<MessageThread>();
}
