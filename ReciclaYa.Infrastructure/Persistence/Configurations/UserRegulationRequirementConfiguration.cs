using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class UserRegulationRequirementConfiguration : IEntityTypeConfiguration<UserRegulationRequirement>
{
    public void Configure(EntityTypeBuilder<UserRegulationRequirement> builder)
    {
        builder.ToTable("user_regulation_requirements", tableBuilder =>
        {
            tableBuilder.HasCheckConstraint(
                "CK_user_regulation_requirements_status",
                "\"Status\" IN ('pending','uploaded','in_review','approved','rejected')");
        });

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id)
            .ValueGeneratedNever();

        builder.Property(item => item.RequirementCode)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.Status)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(item => item.EvidenceUrl)
            .HasMaxLength(1200);

        builder.Property(item => item.Notes)
            .HasMaxLength(500);

        builder.Property(item => item.ReviewedByUserId);

        builder.Property(item => item.ReviewedAt);

        builder.Property(item => item.CreatedAt)
            .IsRequired();

        builder.Property(item => item.UpdatedAt)
            .IsRequired();

        builder.Property(item => item.RowVersion)
            .IsRowVersion();

        builder.HasOne(item => item.User)
            .WithMany(user => user.RegulationRequirements)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.UserId, item.Level, item.RequirementCode })
            .IsUnique();

        builder.HasIndex(item => new { item.UserId, item.Level });
        builder.HasIndex(item => item.Status);
    }
}
