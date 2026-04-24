using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class PreOrder
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public Guid BuyerId { get; set; }

    public decimal Quantity { get; set; }

    public DateTime? DesiredDate { get; set; }

    public bool ReserveStock { get; set; }

    public string? Notes { get; set; }

    public string PaymentMethod { get; set; } = string.Empty;

    public PreOrderStatus Status { get; set; } = PreOrderStatus.Draft;

    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }

    public decimal LogisticsFee { get; set; }

    public decimal AdminFee { get; set; }

    public decimal Total { get; set; }

    public string Currency { get; set; } = "USD";

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public User Buyer { get; set; } = null!;

    public Listing Listing { get; set; } = null!;
}
