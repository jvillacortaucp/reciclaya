using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationAllowedResidueCatalogConfiguration : IEntityTypeConfiguration<RegulationAllowedResidueCatalog>
{
    public void Configure(EntityTypeBuilder<RegulationAllowedResidueCatalog> builder)
    {
        builder.ToTable("regulation_allowed_residues_catalog");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Level).IsRequired();
        builder.Property(item => item.CategoryId).HasMaxLength(80).IsRequired();
        builder.Property(item => item.CategoryTitle).HasMaxLength(180).IsRequired();
        builder.Property(item => item.ResidueName).HasMaxLength(180).IsRequired();
        builder.Property(item => item.QuantityMin).HasColumnType("numeric(18,3)");
        builder.Property(item => item.QuantityMax).HasColumnType("numeric(18,3)");
        builder.Property(item => item.Unit).HasMaxLength(30);
        builder.Property(item => item.SortOrder).IsRequired();
        builder.Property(item => item.IsActive).IsRequired();
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();

        builder.HasOne(item => item.Version)
            .WithMany(version => version.AllowedResidues)
            .HasForeignKey(item => item.VersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.VersionId, item.Level, item.IsActive });
        builder.HasIndex(item => new { item.VersionId, item.ResidueName });
    }
}
