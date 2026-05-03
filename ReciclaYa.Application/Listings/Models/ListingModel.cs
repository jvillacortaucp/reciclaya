namespace ReciclaYa.Application.Listings.Models;

public sealed class ListingModel
{
    public string Id { get; set; } = string.Empty;

    public string ReferenceCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;

    public string ProductType { get; set; } = string.Empty;

    public string SpecificResidue { get; set; } = string.Empty;

    public string SpecificResidueType { get; set; } = string.Empty;

    public string WasteType { get; set; } = string.Empty;

    public string Sector { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Condition { get; set; } = string.Empty;

    public string Restrictions { get; set; } = string.Empty;

    public string SellerName { get; set; } = string.Empty;

    public string SellerVerificationLabel { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    public string Unit { get; set; } = string.Empty;

    public string GenerationFrequency { get; set; } = string.Empty;

    public string Currency { get; set; } = "USD";

    public decimal? PricePerUnitUsd { get; set; }

    public bool Negotiable { get; set; }

    public string Location { get; set; } = string.Empty;

    public string DeliveryMode { get; set; } = string.Empty;

    public string ExchangeType { get; set; } = string.Empty;

    public bool ImmediateAvailability { get; set; }

    public string MaxStorageTime { get; set; } = string.Empty;

    public string LogisticsNotes { get; set; } = string.Empty;

    public string NextAvailabilityDate { get; set; } = string.Empty;

    public int MatchScore { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public string? DraftSavedAt { get; set; }

    public string AiSuggestionNote { get; set; } = string.Empty;

    public IReadOnlyCollection<ListingMediaModel> Media { get; set; } = [];

    public IReadOnlyCollection<ListingTechnicalSpecModel> TechnicalSpecs { get; set; } = [];
}

public sealed class ListingMediaModel
{
    public string Id { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string Alt { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int SizeKb { get; set; }

    public string Type { get; set; } = string.Empty;
}

public sealed class ListingTechnicalSpecModel
{
    public string Key { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
