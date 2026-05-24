using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationLevelRequirementCatalogConfiguration : IEntityTypeConfiguration<RegulationLevelRequirementCatalog>
{
    public void Configure(EntityTypeBuilder<RegulationLevelRequirementCatalog> builder)
    {
        builder.ToTable("regulation_level_requirements_catalog");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Level).IsRequired();
        builder.Property(item => item.RequirementCode).HasMaxLength(120).IsRequired();
        builder.Property(item => item.Title).HasMaxLength(200).IsRequired();
        builder.Property(item => item.Description).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.IsRequired).IsRequired();
        builder.Property(item => item.ActorType).HasMaxLength(20).IsRequired();
        builder.Property(item => item.AcceptedFileTypesJson).HasColumnType("text").IsRequired();
        builder.Property(item => item.SortOrder).IsRequired();
        builder.Property(item => item.IsActive).IsRequired();
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();

        builder.HasOne(item => item.Version)
            .WithMany(version => version.Requirements)
            .HasForeignKey(item => item.VersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.VersionId, item.Level, item.IsActive });
        builder.HasIndex(item => new { item.VersionId, item.RequirementCode }).IsUnique();
    }
}
