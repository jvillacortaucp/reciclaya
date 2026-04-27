namespace ReciclaYa.Domain.Entities;

public sealed class Message
{
    public Guid Id { get; set; }

    public Guid ThreadId { get; set; }

    public Guid SenderId { get; set; }

    public string Body { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? ReadAt { get; set; }

    public MessageThread Thread { get; set; } = null!;

    public User Sender { get; set; } = null!;
}
