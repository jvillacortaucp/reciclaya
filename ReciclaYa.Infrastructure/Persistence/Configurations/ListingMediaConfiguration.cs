using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class ListingMediaConfiguration : IEntityTypeConfiguration<ListingMedia>
{
    public void Configure(EntityTypeBuilder<ListingMedia> builder)
    {
        builder.ToTable("listing_media");

        builder.HasKey(media => media.Id);

        builder.Property(media => media.Id)
            .ValueGeneratedNever();

        builder.Property(media => media.Url)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(media => media.Alt)
            .HasMaxLength(250);

        builder.Property(media => media.Name)
            .HasMaxLength(250);

        builder.Property(media => media.SizeKb)
            .HasPrecision(18, 2);

        builder.Property(media => media.Type)
            .HasMaxLength(120);

        builder.Property(media => media.SortOrder)
            .IsRequired();

        builder.Property(media => media.CreatedAt)
            .IsRequired();

        builder.Property(media => media.UpdatedAt)
            .IsRequired();

        builder.HasIndex(media => media.ListingId);
        builder.HasIndex(media => new { media.ListingId, media.SortOrder });
    }
}
