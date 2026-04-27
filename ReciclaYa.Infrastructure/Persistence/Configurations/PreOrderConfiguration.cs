using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class PreOrderConfiguration : IEntityTypeConfiguration<PreOrder>
{
    public void Configure(EntityTypeBuilder<PreOrder> builder)
    {
        builder.ToTable("pre_orders");

        builder.HasKey(preOrder => preOrder.Id);

        builder.Property(preOrder => preOrder.Id)
            .ValueGeneratedNever();

        builder.Property(preOrder => preOrder.Quantity)
            .HasPrecision(18, 3)
            .IsRequired();

        builder.Property(preOrder => preOrder.Notes)
            .HasMaxLength(2000);

        builder.Property(preOrder => preOrder.PaymentMethod)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(preOrder => preOrder.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(preOrder => preOrder.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(preOrder => preOrder.Subtotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(preOrder => preOrder.LogisticsFee)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(preOrder => preOrder.AdminFee)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(preOrder => preOrder.Total)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(preOrder => preOrder.Currency)
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(preOrder => preOrder.CreatedAt)
            .IsRequired();

        builder.Property(preOrder => preOrder.UpdatedAt)
            .IsRequired();

        builder.HasIndex(preOrder => preOrder.BuyerId);
        builder.HasIndex(preOrder => preOrder.ListingId);
        builder.HasIndex(preOrder => preOrder.Status);
        builder.HasIndex(preOrder => preOrder.CreatedAt);

        builder.HasOne(preOrder => preOrder.Buyer)
            .WithMany(user => user.PreOrders)
            .HasForeignKey(preOrder => preOrder.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(preOrder => preOrder.Listing)
            .WithMany(listing => listing.PreOrders)
            .HasForeignKey(preOrder => preOrder.ListingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
