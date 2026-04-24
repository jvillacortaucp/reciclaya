using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class PersonProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string DocumentNumber { get; set; } = string.Empty;

    public string MobilePhone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string PostalCode { get; set; } = string.Empty;

    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
