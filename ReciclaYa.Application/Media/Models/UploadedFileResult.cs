namespace ReciclaYa.Application.Media.Models;

public sealed record UploadedFileResult(
    string Bucket,
    string StoragePath,
    string? PublicUrl);
