namespace ReciclaYa.Domain.Entities;

public sealed class UserRegulationRequirement
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public int Level { get; set; }

    public string RequirementCode { get; set; } = string.Empty;

    public string Status { get; set; } = "pending";

    public string? EvidenceUrl { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
