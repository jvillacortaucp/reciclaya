namespace ReciclaYa.Domain.Entities;

public sealed class RegulationNormativeReferenceCatalog
{
    public Guid Id { get; set; }

    public Guid VersionId { get; set; }

    public int Level { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Article { get; set; }

    public string? ReferenceUrl { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public RegulationCatalogVersion Version { get; set; } = null!;
}
