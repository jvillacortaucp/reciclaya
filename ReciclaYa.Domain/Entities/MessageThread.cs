using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class MessageThread
{
    public Guid Id { get; set; }

    public Guid? CommercialRequestId { get; set; }

    public Guid ListingId { get; set; }

    public Guid BuyerId { get; set; }

    public Guid SellerId { get; set; }

    public MessageThreadStatus Status { get; set; } = MessageThreadStatus.Active;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public CommercialRequest? CommercialRequest { get; set; }

    public Listing Listing { get; set; } = null!;

    public User Buyer { get; set; } = null!;

    public User Seller { get; set; } = null!;

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
