namespace ReciclaYa.Domain.Entities;

public sealed class RegulationCatalogVersion
{
    public Guid Id { get; set; }

    public int VersionNumber { get; set; }

    public bool IsActive { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<RegulationLevelRequirementCatalog> Requirements { get; set; } = new List<RegulationLevelRequirementCatalog>();

    public ICollection<RegulationAllowedResidueCatalog> AllowedResidues { get; set; } = new List<RegulationAllowedResidueCatalog>();

    public ICollection<RegulationLevelRuleCatalog> Rules { get; set; } = new List<RegulationLevelRuleCatalog>();

    public ICollection<RegulationNormativeReferenceCatalog> NormativeReferences { get; set; } = new List<RegulationNormativeReferenceCatalog>();
}
