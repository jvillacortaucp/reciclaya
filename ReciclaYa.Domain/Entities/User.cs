using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public UserRole Role { get; set; }

    public ProfileType ProfileType { get; set; }

    public UserStatus Status { get; set; } = UserStatus.Active;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Company? Company { get; set; }

    public PersonProfile? PersonProfile { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public ICollection<Listing> Listings { get; set; } = new List<Listing>();

    public ICollection<PurchasePreference> PurchasePreferences { get; set; } = new List<PurchasePreference>();

    public ICollection<PreOrder> PreOrders { get; set; } = new List<PreOrder>();

    public ICollection<PurchaseOrder> BuyerPurchaseOrders { get; set; } = new List<PurchaseOrder>();

    public ICollection<PurchaseOrder> SellerPurchaseOrders { get; set; } = new List<PurchaseOrder>();

    public ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();

    public ICollection<CommercialRequest> BuyerCommercialRequests { get; set; } = new List<CommercialRequest>();

    public ICollection<CommercialRequest> SellerCommercialRequests { get; set; } = new List<CommercialRequest>();

    public ICollection<MessageThread> BuyerMessageThreads { get; set; } = new List<MessageThread>();

    public ICollection<MessageThread> SellerMessageThreads { get; set; } = new List<MessageThread>();

    public ICollection<Message> SentMessages { get; set; } = new List<Message>();

    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
}
