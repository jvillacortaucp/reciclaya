namespace ReciclaYa.Domain.Entities;

public sealed class RegulationLevelRequirementCatalog
{
    public Guid Id { get; set; }

    public Guid VersionId { get; set; }

    public int Level { get; set; }

    public string RequirementCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsRequired { get; set; }

    public string ActorType { get; set; } = "both";

    public string AcceptedFileTypesJson { get; set; } = "[]";

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public RegulationCatalogVersion Version { get; set; } = null!;
}
