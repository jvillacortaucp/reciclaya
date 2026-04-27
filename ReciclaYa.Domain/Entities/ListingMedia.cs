namespace ReciclaYa.Domain.Entities;

public sealed class ListingMedia
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public string Url { get; set; } = string.Empty;

    public string? Alt { get; set; }

    public string? Name { get; set; }

    public decimal? SizeKb { get; set; }

    public string? Type { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Listing Listing { get; set; } = null!;
}
