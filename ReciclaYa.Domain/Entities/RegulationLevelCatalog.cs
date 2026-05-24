namespace ReciclaYa.Domain.Entities;

public sealed class RegulationLevelCatalog
{
    public int Level { get; set; }
    public string PayloadJson { get; set; } = "{}";

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
