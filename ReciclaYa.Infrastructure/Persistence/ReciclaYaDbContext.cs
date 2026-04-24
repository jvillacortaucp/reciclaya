using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence;

public sealed class ReciclaYaDbContext(DbContextOptions<ReciclaYaDbContext> options)
    : DbContext(options), IAuthDbContext
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Company> Companies => Set<Company>();

    public DbSet<PersonProfile> PersonProfiles => Set<PersonProfile>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Listing> Listings => Set<Listing>();

    public DbSet<ListingMedia> ListingMedia => Set<ListingMedia>();

    public DbSet<ListingTechnicalSpec> ListingTechnicalSpecs => Set<ListingTechnicalSpec>();

    public DbSet<PurchasePreference> PurchasePreferences => Set<PurchasePreference>();

    public DbSet<PreOrder> PreOrders => Set<PreOrder>();

    public DbSet<CommercialRequest> CommercialRequests => Set<CommercialRequest>();

    public DbSet<MessageThread> MessageThreads => Set<MessageThread>();

    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReciclaYaDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
