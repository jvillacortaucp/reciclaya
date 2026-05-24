namespace ReciclaYa.Application.Regulation.Options;

public sealed class AiEvidenceCheckOptions
{
    public const string SectionName = "AiEvidenceCheck";

    public bool Enabled { get; set; } = true;

    public decimal ConfidenceThreshold { get; set; } = 0.65m;

    public string Mode { get; set; } = "soft";
}
