using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class PurchasePreferenceConfiguration : IEntityTypeConfiguration<PurchasePreference>
{
    public void Configure(EntityTypeBuilder<PurchasePreference> builder)
    {
        builder.ToTable("purchase_preferences");

        builder.HasKey(preference => preference.Id);

        builder.Property(preference => preference.Id)
            .ValueGeneratedNever();

        builder.Property(preference => preference.ResidueType)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(preference => preference.Sector)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(preference => preference.ProductType)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(preference => preference.SpecificResidue)
            .HasMaxLength(180);

        builder.Property(preference => preference.RequiredVolume)
            .HasPrecision(18, 3)
            .IsRequired();

        builder.Property(preference => preference.Unit)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(preference => preference.PurchaseFrequency)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(preference => preference.MinPriceUsd)
            .HasPrecision(18, 2);

        builder.Property(preference => preference.MaxPriceUsd)
            .HasPrecision(18, 2);

        builder.Property(preference => preference.DesiredCondition)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(preference => preference.ReceivingLocation)
            .HasMaxLength(300)
            .IsRequired();

        builder.Property(preference => preference.PreferredMode)
            .HasMaxLength(60)
            .IsRequired();

        builder.Property(preference => preference.AcceptedExchangeType)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(preference => preference.Notes)
            .HasMaxLength(2000);

        builder.Property(preference => preference.Priority)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(preference => preference.ProfileStatus)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(preference => preference.CreatedAt)
            .IsRequired();

        builder.Property(preference => preference.UpdatedAt)
            .IsRequired();

        builder.HasIndex(preference => preference.BuyerId);
        builder.HasIndex(preference => preference.ProfileStatus);
        builder.HasIndex(preference => preference.ResidueType);
        builder.HasIndex(preference => preference.Sector);
        builder.HasIndex(preference => preference.ProductType);

        builder.HasOne(preference => preference.Buyer)
            .WithMany(user => user.PurchasePreferences)
            .HasForeignKey(preference => preference.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
