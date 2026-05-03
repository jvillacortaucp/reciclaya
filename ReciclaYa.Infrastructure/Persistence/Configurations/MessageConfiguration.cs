using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.Persistence.Configurations;

public sealed class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("messages");

        builder.HasKey(message => message.Id);

        builder.Property(message => message.Id)
            .ValueGeneratedNever();

        builder.Property(message => message.Body)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(message => message.CreatedAt)
            .IsRequired();

        builder.HasIndex(message => message.ThreadId);
        builder.HasIndex(message => message.SenderId);
        builder.HasIndex(message => message.CreatedAt);
        builder.HasIndex(message => message.ReadAt);

        builder.HasOne(message => message.Thread)
            .WithMany(thread => thread.Messages)
            .HasForeignKey(message => message.ThreadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(message => message.Sender)
            .WithMany(user => user.SentMessages)
            .HasForeignKey(message => message.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
