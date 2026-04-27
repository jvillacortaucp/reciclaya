using ReciclaYa.Application.Media.Models;

namespace ReciclaYa.Application.Media.Services;

public interface IStorageService
{
    Task<UploadedFileResult> UploadAsync(MediaUploadCommand command, CancellationToken cancellationToken);

    Task DeleteAsync(string bucket, string storagePath, CancellationToken cancellationToken);
}
