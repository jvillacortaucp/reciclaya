using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationCatalogVersionConfiguration : IEntityTypeConfiguration<RegulationCatalogVersion>
{
    public void Configure(EntityTypeBuilder<RegulationCatalogVersion> builder)
    {
        builder.ToTable("regulation_catalog_versions");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.VersionNumber).IsRequired();
        builder.Property(item => item.IsActive).IsRequired();
        builder.Property(item => item.Notes).HasMaxLength(500);
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();

        builder.HasIndex(item => item.VersionNumber).IsUnique();
        builder.HasIndex(item => item.IsActive);
    }
}
