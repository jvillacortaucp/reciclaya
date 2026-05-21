using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class RegulationOperationAuditConfiguration : IEntityTypeConfiguration<RegulationOperationAudit>
{
    public void Configure(EntityTypeBuilder<RegulationOperationAudit> builder)
    {
        builder.ToTable("regulation_operation_audits");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id)
            .ValueGeneratedNever();

        builder.Property(item => item.Actor)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(item => item.Action)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(item => item.BlockingReasonCode)
            .HasMaxLength(80);

        builder.Property(item => item.ContextResidueType)
            .HasMaxLength(120);

        builder.Property(item => item.ContextSector)
            .HasMaxLength(120);

        builder.Property(item => item.ContextProductType)
            .HasMaxLength(120);

        builder.Property(item => item.ContextSpecificResidue)
            .HasMaxLength(200);

        builder.Property(item => item.ContextUnit)
            .HasMaxLength(30);

        builder.Property(item => item.CreatedAt)
            .IsRequired();

        builder.HasOne(item => item.User)
            .WithMany(user => user.RegulationOperationAudits)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.UserId, item.CreatedAt });
        builder.HasIndex(item => new { item.Action, item.CreatedAt });
        builder.HasIndex(item => item.Allowed);
    }
}
