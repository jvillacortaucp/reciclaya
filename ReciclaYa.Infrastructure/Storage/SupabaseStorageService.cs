using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Options;
using ReciclaYa.Application.Media.Services;

namespace ReciclaYa.Infrastructure.Storage;

public sealed class SupabaseStorageService(
    HttpClient httpClient,
    IOptions<SupabaseOptions> supabaseOptions,
    ILogger<SupabaseStorageService> logger) : IStorageService
{
    private readonly SupabaseOptions _supabaseOptions = supabaseOptions.Value;

    public async Task<UploadedFileResult> UploadAsync(MediaUploadCommand command, CancellationToken cancellationToken)
    {
        ValidateConfiguration();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"storage/v1/object/{command.Bucket}/{command.StoragePath}");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _supabaseOptions.ServiceRoleKey);
        request.Headers.TryAddWithoutValidation("apikey", _supabaseOptions.ServiceRoleKey);
        request.Headers.TryAddWithoutValidation("x-upsert", "false");
        request.Content = new ByteArrayContent(command.Content);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(command.ContentType);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning(
                "Supabase upload failed with status {StatusCode}. Response: {ResponseBody}",
                (int)response.StatusCode,
                body);

            throw new InvalidOperationException("Supabase upload request failed.");
        }

        var publicUrl = command.Visibility == Domain.Enums.MediaVisibility.Public
            ? $"{_supabaseOptions.Url.TrimEnd('/')}/storage/v1/object/public/{command.Bucket}/{command.StoragePath}"
            : null;

        return new UploadedFileResult(command.Bucket, command.StoragePath, publicUrl);
    }

    public async Task DeleteAsync(string bucket, string storagePath, CancellationToken cancellationToken)
    {
        ValidateConfiguration();

        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"storage/v1/object/{bucket}/{storagePath}");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _supabaseOptions.ServiceRoleKey);
        request.Headers.TryAddWithoutValidation("apikey", _supabaseOptions.ServiceRoleKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning(
                "Supabase delete failed with status {StatusCode}. Response: {ResponseBody}",
                (int)response.StatusCode,
                body);

            throw new InvalidOperationException("Supabase delete request failed.");
        }
    }

    private void ValidateConfiguration()
    {
        if (string.IsNullOrWhiteSpace(_supabaseOptions.Url)
            || string.IsNullOrWhiteSpace(_supabaseOptions.ServiceRoleKey))
        {
            throw new InvalidOperationException("Supabase storage is not configured.");
        }
    }
}
