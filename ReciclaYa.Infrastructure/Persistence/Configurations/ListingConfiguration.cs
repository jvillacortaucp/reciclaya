using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class ListingConfiguration : IEntityTypeConfiguration<Listing>
{
    public void Configure(EntityTypeBuilder<Listing> builder)
    {
        builder.ToTable("listings");

        builder.HasKey(listing => listing.Id);

        builder.Property(listing => listing.Id)
            .ValueGeneratedNever();

        builder.Property(listing => listing.ReferenceCode)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(listing => listing.WasteType)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(listing => listing.Sector)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(listing => listing.ProductType)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(listing => listing.SpecificResidue)
            .HasMaxLength(180)
            .IsRequired();

        builder.Property(listing => listing.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(listing => listing.Quantity)
            .HasPrecision(18, 3)
            .IsRequired();

        builder.Property(listing => listing.Unit)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(listing => listing.GenerationFrequency)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(listing => listing.PricePerUnitUsd)
            .HasPrecision(18, 2);

        builder.Property(listing => listing.Currency)
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(listing => listing.Location)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(listing => listing.MaxStorageTime)
            .HasMaxLength(60);

        builder.Property(listing => listing.ExchangeType)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(listing => listing.DeliveryMode)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(listing => listing.Condition)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(listing => listing.Restrictions)
            .HasMaxLength(2000);

        builder.Property(listing => listing.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(listing => listing.AiSuggestionNote)
            .HasMaxLength(1000);

        builder.Property(listing => listing.CreatedAt)
            .IsRequired();

        builder.Property(listing => listing.UpdatedAt)
            .IsRequired();

        builder.HasIndex(listing => listing.SellerId);
        builder.HasIndex(listing => listing.Status);
        builder.HasIndex(listing => listing.CreatedAt);
        builder.HasIndex(listing => listing.WasteType);
        builder.HasIndex(listing => listing.Sector);
        builder.HasIndex(listing => listing.ProductType);
        builder.HasIndex(listing => listing.ExchangeType);
        builder.HasIndex(listing => listing.Location);

        builder.HasIndex(listing => listing.ReferenceCode)
            .IsUnique();

        builder.HasOne(listing => listing.Seller)
            .WithMany(user => user.Listings)
            .HasForeignKey(listing => listing.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(listing => listing.Media)
            .WithOne(media => media.Listing)
            .HasForeignKey(media => media.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(listing => listing.TechnicalSpecs)
            .WithOne(technicalSpec => technicalSpec.Listing)
            .HasForeignKey(technicalSpec => technicalSpec.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(listing => listing.PreOrders)
            .WithOne(preOrder => preOrder.Listing)
            .HasForeignKey(preOrder => preOrder.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(listing => listing.PurchaseOrders)
            .WithOne(order => order.Listing)
            .HasForeignKey(order => order.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(listing => listing.PaymentTransactions)
            .WithOne(transaction => transaction.Listing)
            .HasForeignKey(transaction => transaction.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(listing => listing.ValorizationIdeas)
            .WithOne(idea => idea.Listing)
            .HasForeignKey(idea => idea.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
