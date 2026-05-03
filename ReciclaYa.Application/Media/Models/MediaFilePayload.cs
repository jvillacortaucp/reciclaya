namespace ReciclaYa.Application.Media.Models;

public sealed record MediaFilePayload(
    string FileName,
    string ContentType,
    long SizeBytes,
    byte[] Content);
