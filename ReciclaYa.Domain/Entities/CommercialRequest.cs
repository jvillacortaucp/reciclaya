using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class CommercialRequest
{
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public Guid BuyerId { get; set; }

    public Guid SellerId { get; set; }

    public string? Message { get; set; }

    public CommercialRequestStatus Status { get; set; } = CommercialRequestStatus.Pending;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? RespondedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public Listing Listing { get; set; } = null!;

    public User Buyer { get; set; } = null!;

    public User Seller { get; set; } = null!;

    public ICollection<MessageThread> MessageThreads { get; set; } = new List<MessageThread>();
}
