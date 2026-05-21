using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class UserRegulationProfileConfiguration : IEntityTypeConfiguration<UserRegulationProfile>
{
    public void Configure(EntityTypeBuilder<UserRegulationProfile> builder)
    {
        builder.ToTable("user_regulation_profiles");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id)
            .ValueGeneratedNever();

        builder.Property(item => item.CurrentLevel)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(item => item.CreatedAt)
            .IsRequired();

        builder.Property(item => item.UpdatedAt)
            .IsRequired();

        builder.HasOne(item => item.User)
            .WithOne(user => user.RegulationProfile)
            .HasForeignKey<UserRegulationProfile>(item => item.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => item.UserId)
            .IsUnique();

        builder.HasIndex(item => item.CurrentLevel);
    }
}
