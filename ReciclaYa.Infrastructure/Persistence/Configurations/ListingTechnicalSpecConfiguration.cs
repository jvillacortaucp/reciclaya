using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class ListingTechnicalSpecConfiguration : IEntityTypeConfiguration<ListingTechnicalSpec>
{
    public void Configure(EntityTypeBuilder<ListingTechnicalSpec> builder)
    {
        builder.ToTable("listing_technical_specs");

        builder.HasKey(technicalSpec => technicalSpec.Id);

        builder.Property(technicalSpec => technicalSpec.Id)
            .ValueGeneratedNever();

        builder.Property(technicalSpec => technicalSpec.Key)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(technicalSpec => technicalSpec.Label)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(technicalSpec => technicalSpec.Value)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(technicalSpec => technicalSpec.CreatedAt)
            .IsRequired();

        builder.Property(technicalSpec => technicalSpec.UpdatedAt)
            .IsRequired();

        builder.HasIndex(technicalSpec => technicalSpec.ListingId);
        builder.HasIndex(technicalSpec => new { technicalSpec.ListingId, technicalSpec.Key });
    }
}
