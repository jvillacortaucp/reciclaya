using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class PurchaseOrder
{
    public Guid Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public Guid BuyerId { get; set; }

    public Guid SellerId { get; set; }

    public Guid ListingId { get; set; }

    public Guid? PreOrderId { get; set; }

    public Guid? PaymentTransactionId { get; set; }

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }

    public decimal LogisticsFee { get; set; }

    public decimal AdminFee { get; set; }

    public decimal Total { get; set; }

    public string Currency { get; set; } = "USD";

    public OrderStatus Status { get; set; } = OrderStatus.Created;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    public User Buyer { get; set; } = null!;

    public User Seller { get; set; } = null!;

    public Listing Listing { get; set; } = null!;

    public PreOrder? PreOrder { get; set; }

    public ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
}
