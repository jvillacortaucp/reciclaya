using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class PaymentTransaction
{
    public Guid Id { get; set; }

    public Guid BuyerId { get; set; }

    public Guid OrderId { get; set; }

    public Guid ListingId { get; set; }

    public string Provider { get; set; } = string.Empty;

    public string? ProviderReference { get; set; }

    public decimal Amount { get; set; }

    public string Currency { get; set; } = "USD";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string PaymentMethod { get; set; } = string.Empty;

    public string? CardLast4 { get; set; }

    public string? CardBrand { get; set; }

    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    public User Buyer { get; set; } = null!;

    public PurchaseOrder Order { get; set; } = null!;

    public Listing Listing { get; set; } = null!;
}
