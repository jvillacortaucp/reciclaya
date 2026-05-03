using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class ValorizationIdeaConfiguration : IEntityTypeConfiguration<ValorizationIdea>
{
    public void Configure(EntityTypeBuilder<ValorizationIdea> builder)
    {
        builder.ToTable("valorization_ideas");

        builder.HasKey(idea => idea.Id);

        builder.Property(idea => idea.Id)
            .ValueGeneratedNever();

        builder.Property(idea => idea.Title)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(idea => idea.Summary)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(idea => idea.SuggestedProduct)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(idea => idea.ProcessOverview)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(idea => idea.PotentialBuyers)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(idea => idea.RequiredConditions)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(idea => idea.SellerRecommendation)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(idea => idea.BuyerRecommendation)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(idea => idea.RecommendedStrategy)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(idea => idea.ViabilityLevel)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(idea => idea.EstimatedImpact)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(idea => idea.Warnings)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(idea => idea.Source)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(idea => idea.CreatedAt)
            .IsRequired();

        builder.Property(idea => idea.UpdatedAt)
            .IsRequired();

        builder.HasIndex(idea => idea.ListingId);
        builder.HasIndex(idea => idea.CreatedAt);
        builder.HasIndex(idea => idea.Source);
    }
}
