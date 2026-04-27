using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Media.Models;

public sealed record MediaUploadCommand(
    string Bucket,
    string StoragePath,
    string ContentType,
    byte[] Content,
    MediaVisibility Visibility);
