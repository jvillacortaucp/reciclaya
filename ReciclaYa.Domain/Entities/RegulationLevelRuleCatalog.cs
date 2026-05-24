namespace ReciclaYa.Domain.Entities;

public sealed class RegulationLevelRuleCatalog
{
    public Guid Id { get; set; }

    public Guid VersionId { get; set; }

    public int Level { get; set; }

    public string RuleGroup { get; set; } = string.Empty;

    public string ItemText { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public RegulationCatalogVersion Version { get; set; } = null!;
}
