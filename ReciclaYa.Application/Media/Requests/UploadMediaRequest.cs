namespace ReciclaYa.Application.Media.Requests;

public sealed record UploadMediaRequest(
    string EntityType,
    Guid? EntityId,
    string Purpose,
    string Visibility,
    string? Alt,
    int? SortOrder);
