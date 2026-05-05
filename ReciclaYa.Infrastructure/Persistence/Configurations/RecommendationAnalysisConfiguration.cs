using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RecommendationAnalysisConfiguration : IEntityTypeConfiguration<RecommendationAnalysis>
{
    public void Configure(EntityTypeBuilder<RecommendationAnalysis> builder)
    {
        builder.ToTable("recommendation_analyses");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id)
            .ValueGeneratedNever();

        builder.Property(item => item.SelectedProductId)
            .HasMaxLength(200);

        builder.Property(item => item.AnalysisOrigin)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(item => item.ChatbotProductId)
            .HasMaxLength(200);

        builder.Property(item => item.ChatbotProductName)
            .HasMaxLength(200);

        builder.Property(item => item.ChatbotResidueInput)
            .HasMaxLength(200);

        builder.Property(item => item.ChatbotSectorName)
            .HasMaxLength(200);

        builder.Property(item => item.Source)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(item => item.Status)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(item => item.PayloadJson)
            .HasColumnType("text")
            .IsRequired();

        builder.Property(item => item.CoveragePercent)
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(item => item.ErrorCode)
            .HasMaxLength(80);

        builder.Property(item => item.CreatedAt)
            .IsRequired();

        builder.Property(item => item.UpdatedAt)
            .IsRequired();

        builder.HasOne(item => item.Listing)
            .WithMany()
            .HasForeignKey(item => item.ListingId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.HasIndex(item => new { item.ListingId, item.SelectedProductId, item.CreatedAt });
        builder.HasIndex(item => new { item.UserId, item.AnalysisOrigin, item.ChatbotProductId, item.CreatedAt });
        builder.HasIndex(item => item.CreatedAt);
        builder.HasIndex(item => item.AnalysisOrigin);
        builder.HasIndex(item => item.Source);
        builder.HasIndex(item => item.Status);
    }
}
