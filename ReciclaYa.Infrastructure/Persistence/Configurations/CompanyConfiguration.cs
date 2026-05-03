using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("companies");

        builder.HasKey(company => company.Id);

        builder.Property(company => company.Id)
            .ValueGeneratedNever();

        builder.Property(company => company.Ruc)
            .HasMaxLength(11)
            .IsRequired();

        builder.Property(company => company.BusinessName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(company => company.LogoUrl)
            .HasMaxLength(1200);

        builder.Property(company => company.MobilePhone)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(company => company.Address)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(company => company.PostalCode)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(company => company.LegalRepresentative)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(company => company.Position)
            .HasMaxLength(120)
            .IsRequired();

        builder.Property(company => company.VerificationStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(company => company.CreatedAt)
            .IsRequired();

        builder.Property(company => company.UpdatedAt)
            .IsRequired();

        builder.HasIndex(company => company.UserId)
            .IsUnique();

        builder.HasIndex(company => company.Ruc)
            .IsUnique();

        builder.HasIndex(company => company.VerificationStatus);

        builder.HasOne(company => company.User)
            .WithOne(user => user.Company)
            .HasForeignKey<Company>(company => company.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
