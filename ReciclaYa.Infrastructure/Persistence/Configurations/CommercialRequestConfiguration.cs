using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class CommercialRequestConfiguration : IEntityTypeConfiguration<CommercialRequest>
{
    public void Configure(EntityTypeBuilder<CommercialRequest> builder)
    {
        builder.ToTable("commercial_requests");

        builder.HasKey(request => request.Id);

        builder.Property(request => request.Id)
            .ValueGeneratedNever();

        builder.Property(request => request.Message)
            .HasMaxLength(2000);

        builder.Property(request => request.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(request => request.CreatedAt)
            .IsRequired();

        builder.Property(request => request.UpdatedAt)
            .IsRequired();

        builder.HasIndex(request => request.ListingId);
        builder.HasIndex(request => request.BuyerId);
        builder.HasIndex(request => request.SellerId);
        builder.HasIndex(request => request.Status);
        builder.HasIndex(request => request.CreatedAt);

        builder.HasOne(request => request.Listing)
            .WithMany(listing => listing.CommercialRequests)
            .HasForeignKey(request => request.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(request => request.Buyer)
            .WithMany(user => user.BuyerCommercialRequests)
            .HasForeignKey(request => request.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(request => request.Seller)
            .WithMany(user => user.SellerCommercialRequests)
            .HasForeignKey(request => request.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
