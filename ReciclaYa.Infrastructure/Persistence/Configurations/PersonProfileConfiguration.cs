using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class PersonProfileConfiguration : IEntityTypeConfiguration<PersonProfile>
{
    public void Configure(EntityTypeBuilder<PersonProfile> builder)
    {
        builder.ToTable("person_profiles");

        builder.HasKey(profile => profile.Id);

        builder.Property(profile => profile.Id)
            .ValueGeneratedNever();

        builder.Property(profile => profile.FirstName)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(profile => profile.LastName)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(profile => profile.DocumentNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(profile => profile.MobilePhone)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(profile => profile.Address)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(profile => profile.PostalCode)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(profile => profile.VerificationStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(profile => profile.CreatedAt)
            .IsRequired();

        builder.Property(profile => profile.UpdatedAt)
            .IsRequired();

        builder.HasIndex(profile => profile.UserId)
            .IsUnique();

        builder.HasIndex(profile => profile.DocumentNumber)
            .IsUnique();

        builder.HasIndex(profile => profile.VerificationStatus);

        builder.HasOne(profile => profile.User)
            .WithOne(user => user.PersonProfile)
            .HasForeignKey<PersonProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
