using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class MediaAssetConfiguration : IEntityTypeConfiguration<MediaAsset>
{
    public void Configure(EntityTypeBuilder<MediaAsset> builder)
    {
        builder.ToTable("media_assets");

        builder.HasKey(asset => asset.Id);

        builder.Property(asset => asset.Id)
            .ValueGeneratedNever();

        builder.Property(asset => asset.EntityType)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(asset => asset.Purpose)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(asset => asset.Bucket)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(asset => asset.StoragePath)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(asset => asset.PublicUrl)
            .HasMaxLength(1200);

        builder.Property(asset => asset.OriginalFileName)
            .HasMaxLength(260)
            .IsRequired();

        builder.Property(asset => asset.ContentType)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(asset => asset.Alt)
            .HasMaxLength(300);

        builder.Property(asset => asset.Visibility)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(asset => asset.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(asset => asset.CreatedAt)
            .IsRequired();

        builder.Property(asset => asset.UpdatedAt)
            .IsRequired();

        builder.HasIndex(asset => asset.OwnerUserId);
        builder.HasIndex(asset => new { asset.EntityType, asset.EntityId });
        builder.HasIndex(asset => asset.Purpose);
        builder.HasIndex(asset => asset.Status);
        builder.HasIndex(asset => asset.CreatedAt);

        builder.HasOne(asset => asset.OwnerUser)
            .WithMany(user => user.MediaAssets)
            .HasForeignKey(asset => asset.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
