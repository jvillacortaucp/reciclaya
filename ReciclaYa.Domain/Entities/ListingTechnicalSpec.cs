namespace ReciclaYa.Domain.Entities;

public sealed class ListingTechnicalSpec
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public string Key { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Listing Listing { get; set; } = null!;
}
