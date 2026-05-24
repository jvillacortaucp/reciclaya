namespace ReciclaYa.Domain.Entities;

public sealed class RegulationOperationAudit
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Actor { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    public bool Allowed { get; set; }

    public int RequiredMinLevel { get; set; }

    public int ActorCurrentLevel { get; set; }

    public string? BlockingReasonCode { get; set; }

    public string? ContextResidueType { get; set; }

    public string? ContextSector { get; set; }

    public string? ContextProductType { get; set; }

    public string? ContextSpecificResidue { get; set; }

    public decimal? ContextQuantity { get; set; }

    public string? ContextUnit { get; set; }

    public bool ManualReviewRequired { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
