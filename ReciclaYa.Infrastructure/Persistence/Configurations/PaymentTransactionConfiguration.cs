using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class PaymentTransactionConfiguration : IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("payment_transactions");

        builder.HasKey(transaction => transaction.Id);

        builder.Property(transaction => transaction.Id)
            .ValueGeneratedNever();

        builder.Property(transaction => transaction.Provider)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(transaction => transaction.ProviderReference)
            .HasMaxLength(80);

        builder.Property(transaction => transaction.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(transaction => transaction.Currency)
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(transaction => transaction.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(transaction => transaction.PaymentMethod)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(transaction => transaction.CardLast4)
            .HasMaxLength(4);

        builder.Property(transaction => transaction.CardBrand)
            .HasMaxLength(20);

        builder.Property(transaction => transaction.FailureReason)
            .HasMaxLength(500);

        builder.Property(transaction => transaction.CreatedAt)
            .IsRequired();

        builder.Property(transaction => transaction.UpdatedAt)
            .IsRequired();

        builder.HasIndex(transaction => transaction.BuyerId);
        builder.HasIndex(transaction => transaction.OrderId);
        builder.HasIndex(transaction => transaction.ListingId);
        builder.HasIndex(transaction => transaction.Status);
        builder.HasIndex(transaction => transaction.CreatedAt);

        builder.HasOne(transaction => transaction.Buyer)
            .WithMany(user => user.PaymentTransactions)
            .HasForeignKey(transaction => transaction.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(transaction => transaction.Listing)
            .WithMany(listing => listing.PaymentTransactions)
            .HasForeignKey(transaction => transaction.ListingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
