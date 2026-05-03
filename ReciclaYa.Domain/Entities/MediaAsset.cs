using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class MediaAsset
{
    public Guid Id { get; set; }

    public Guid OwnerUserId { get; set; }

    public string EntityType { get; set; } = string.Empty;

    public Guid? EntityId { get; set; }

    public string Purpose { get; set; } = string.Empty;

    public string Bucket { get; set; } = string.Empty;

    public string StoragePath { get; set; } = string.Empty;

    public string? PublicUrl { get; set; }

    public string OriginalFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public string? Alt { get; set; }

    public int? SortOrder { get; set; }

    public MediaVisibility Visibility { get; set; } = MediaVisibility.Public;

    public MediaStatus Status { get; set; } = MediaStatus.Active;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public User OwnerUser { get; set; } = null!;
}
