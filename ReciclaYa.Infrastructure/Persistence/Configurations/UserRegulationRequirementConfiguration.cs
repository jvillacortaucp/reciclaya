using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class UserRegulationRequirementConfiguration : IEntityTypeConfiguration<UserRegulationRequirement>
{
    public void Configure(EntityTypeBuilder<UserRegulationRequirement> builder)
    {
        builder.ToTable("user_regulation_requirements");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id)
            .ValueGeneratedNever();

        builder.Property(item => item.RequirementCode)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(item => item.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(item => item.EvidenceUrl)
            .HasMaxLength(1200);

        builder.Property(item => item.Notes)
            .HasMaxLength(500);

        builder.Property(item => item.CreatedAt)
            .IsRequired();

        builder.Property(item => item.UpdatedAt)
            .IsRequired();

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
