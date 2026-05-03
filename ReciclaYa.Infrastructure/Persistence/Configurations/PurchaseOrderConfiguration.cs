using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("purchase_orders");

        builder.HasKey(order => order.Id);

        builder.Property(order => order.Id)
            .ValueGeneratedNever();

        builder.Property(order => order.OrderNumber)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(order => order.Quantity)
            .HasPrecision(18, 3)
            .IsRequired();

        builder.Property(order => order.UnitPrice)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(order => order.Subtotal)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(order => order.LogisticsFee)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(order => order.AdminFee)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(order => order.Total)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(order => order.Currency)
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(order => order.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(order => order.CreatedAt)
            .IsRequired();

        builder.Property(order => order.UpdatedAt)
            .IsRequired();

        builder.HasIndex(order => order.OrderNumber)
            .IsUnique();

        builder.HasIndex(order => order.BuyerId);
        builder.HasIndex(order => order.SellerId);
        builder.HasIndex(order => order.ListingId);
        builder.HasIndex(order => order.PreOrderId);
        builder.HasIndex(order => order.Status);
        builder.HasIndex(order => order.CreatedAt);

        builder.HasOne(order => order.Buyer)
            .WithMany(user => user.BuyerPurchaseOrders)
            .HasForeignKey(order => order.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(order => order.Seller)
            .WithMany(user => user.SellerPurchaseOrders)
            .HasForeignKey(order => order.SellerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(order => order.Listing)
            .WithMany(listing => listing.PurchaseOrders)
            .HasForeignKey(order => order.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(order => order.PreOrder)
            .WithMany(preOrder => preOrder.PurchaseOrders)
            .HasForeignKey(order => order.PreOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(order => order.PaymentTransactions)
            .WithOne(transaction => transaction.Order)
            .HasForeignKey(transaction => transaction.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
