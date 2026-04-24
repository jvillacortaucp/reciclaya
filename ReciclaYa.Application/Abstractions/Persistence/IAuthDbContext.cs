using Microsoft.EntityFrameworkCore;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.Abstractions.Persistence;

public interface IAuthDbContext
{
    DbSet<User> Users { get; }

    DbSet<Company> Companies { get; }

    DbSet<PersonProfile> PersonProfiles { get; }

    DbSet<RefreshToken> RefreshTokens { get; }

    DbSet<Listing> Listings { get; }

    DbSet<ListingMedia> ListingMedia { get; }

    DbSet<ListingTechnicalSpec> ListingTechnicalSpecs { get; }

    DbSet<PurchasePreference> PurchasePreferences { get; }

    DbSet<PreOrder> PreOrders { get; }

    DbSet<PurchaseOrder> PurchaseOrders { get; }

    DbSet<PaymentTransaction> PaymentTransactions { get; }

    DbSet<CommercialRequest> CommercialRequests { get; }

    DbSet<MessageThread> MessageThreads { get; }

    DbSet<Message> Messages { get; }

    DbSet<ValorizationIdea> ValorizationIdeas { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
