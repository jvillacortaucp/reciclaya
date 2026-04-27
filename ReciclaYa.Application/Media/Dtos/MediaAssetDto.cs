namespace ReciclaYa.Application.Media.Dtos;

public sealed record MediaAssetDto(
    Guid Id,
    Guid OwnerUserId,
    string EntityType,
    Guid? EntityId,
    string Purpose,
    string? Url,
    string OriginalFileName,
    string ContentType,
    long SizeBytes,
    string? Alt,
    int? SortOrder,
    string Visibility);
