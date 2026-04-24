namespace ReciclaYa.Domain.Entities;

public sealed class PurchasePreference
{
    public Guid Id { get; set; }

    public Guid BuyerId { get; set; }

    public string ResidueType { get; set; } = string.Empty;

    public string Sector { get; set; } = string.Empty;

    public string ProductType { get; set; } = string.Empty;

    public string? SpecificResidue { get; set; }

    public decimal RequiredVolume { get; set; }

    public string Unit { get; set; } = string.Empty;

    public string PurchaseFrequency { get; set; } = string.Empty;

    public decimal? MinPriceUsd { get; set; }

    public decimal? MaxPriceUsd { get; set; }

    public string DesiredCondition { get; set; } = string.Empty;

    public string ReceivingLocation { get; set; } = string.Empty;

    public int RadiusKm { get; set; }

    public string PreferredMode { get; set; } = string.Empty;

    public string AcceptedExchangeType { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public bool AlertOnMatch { get; set; }

    public string Priority { get; set; } = string.Empty;

    public string ProfileStatus { get; set; } = string.Empty;

    public DateTime? DraftSavedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User Buyer { get; set; } = null!;
}
