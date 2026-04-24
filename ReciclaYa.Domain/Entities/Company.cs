using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class Company
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Ruc { get; set; } = string.Empty;

    public string BusinessName { get; set; } = string.Empty;

    public string MobilePhone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public string LegalRepresentative { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
