using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationLevelRuleCatalogConfiguration : IEntityTypeConfiguration<RegulationLevelRuleCatalog>
{
    public void Configure(EntityTypeBuilder<RegulationLevelRuleCatalog> builder)
    {
        builder.ToTable("regulation_level_rules_catalog");

        builder.HasKey(item => item.Id);
        builder.Property(item => item.Level).IsRequired();
        builder.Property(item => item.RuleGroup).HasMaxLength(80).IsRequired();
        builder.Property(item => item.ItemText).HasMaxLength(1000).IsRequired();
        builder.Property(item => item.SortOrder).IsRequired();
        builder.Property(item => item.IsActive).IsRequired();
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();

        builder.HasOne(item => item.Version)
            .WithMany(version => version.Rules)
            .HasForeignKey(item => item.VersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.VersionId, item.Level, item.RuleGroup, item.IsActive });
    }
}
