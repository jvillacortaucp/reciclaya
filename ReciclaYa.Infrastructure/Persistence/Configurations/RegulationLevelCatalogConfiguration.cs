using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationLevelCatalogConfiguration : IEntityTypeConfiguration<RegulationLevelCatalog>
{
    public void Configure(EntityTypeBuilder<RegulationLevelCatalog> builder)
    {
        builder.ToTable("regulation_level_catalogs");

        builder.HasKey(item => item.Level);

        builder.Property(item => item.Level)
            .ValueGeneratedNever();

        builder.Property(item => item.PayloadJson).HasColumnType("text").IsRequired();
        builder.Property(item => item.CreatedAt).IsRequired();
        builder.Property(item => item.UpdatedAt).IsRequired();
    }
}
