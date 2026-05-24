namespace ReciclaYa.Application.Media.Models;

public sealed record DownloadedFileResult(
    string FileName,
    string ContentType,
    byte[] Content);

