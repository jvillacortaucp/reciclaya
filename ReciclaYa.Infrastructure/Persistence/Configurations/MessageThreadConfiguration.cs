using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class MessageThreadConfiguration : IEntityTypeConfiguration<MessageThread>
{
    public void Configure(EntityTypeBuilder<MessageThread> builder)
    {
        builder.ToTable("message_threads");

        builder.HasKey(thread => thread.Id);

        builder.Property(thread => thread.Id)
            .ValueGeneratedNever();

        builder.Property(thread => thread.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(thread => thread.CreatedAt)
            .IsRequired();

        builder.Property(thread => thread.UpdatedAt)
            .IsRequired();

        builder.HasIndex(thread => thread.CommercialRequestId);
        builder.HasIndex(thread => thread.ListingId);
        builder.HasIndex(thread => thread.BuyerId);
        builder.HasIndex(thread => thread.SellerId);
        builder.HasIndex(thread => thread.Status);
        builder.HasIndex(thread => thread.LastMessageAt);
        builder.HasIndex(thread => thread.CreatedAt);

        builder.HasOne(thread => thread.CommercialRequest)
            .WithMany(request => request.MessageThreads)
            .HasForeignKey(thread => thread.CommercialRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(thread => thread.Listing)
            .WithMany(listing => listing.MessageThreads)
            .HasForeignKey(thread => thread.ListingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(thread => thread.Buyer)
            .WithMany(user => user.BuyerMessageThreads)
            .HasForeignKey(thread => thread.BuyerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(thread => thread.Seller)
            .WithMany(user => user.SellerMessageThreads)
            .HasForeignKey(thread => thread.SellerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
