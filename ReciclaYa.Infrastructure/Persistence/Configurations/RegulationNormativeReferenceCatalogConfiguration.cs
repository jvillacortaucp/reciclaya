using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationNormativeReferenceCatalogConfiguration : IEntityTypeConfiguration<RegulationNormativeReferenceCatalog>
{
    public void Configure(EntityTypeBuilder<RegulationNormativeReferenceCatalog> builder)
    {
        builder.ToTable("regulation_normative_references_catalog");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Level).IsRequired();
        builder.Property(item => item.Code).HasMaxLength(100).IsRequired();
        builder.Property(item => item.Title).HasMaxLength(500).IsRequired();
        builder.Property(item => item.Article).HasMaxLength(200);
        builder.Property(item => item.ReferenceUrl).HasMaxLength(1200);
        builder.Property(item => item.SortOrder).IsRequired();
        builder.Property(item => item.IsActive).IsRequired();
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();

        builder.HasOne(item => item.Version)
            .WithMany(version => version.NormativeReferences)
            .HasForeignKey(item => item.VersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.VersionId, item.Level, item.IsActive });
    }
}
