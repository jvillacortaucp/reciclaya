using System.IO;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Dtos;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Options;
using ReciclaYa.Application.Media.Requests;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Media.Services;

public sealed class MediaService(
    IAuthDbContext dbContext,
    IStorageService storageService,
    IOptions<SupabaseOptions> supabaseOptions,
    ILogger<MediaService> logger) : IMediaService
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private readonly SupabaseOptions _supabaseOptions = supabaseOptions.Value;

    public Task<AuthResult<MediaAssetDto>> UploadAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        UploadMediaRequest request,
        CancellationToken cancellationToken = default)
    {
        return UploadCoreAsync(currentUserId, currentUserRole, file, request, cancellationToken);
    }

    public Task<AuthResult<MediaAssetDto>> UploadProfileAvatarAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        CancellationToken cancellationToken = default)
    {
        return UploadCoreAsync(
            currentUserId,
            currentUserRole,
            file,
            new UploadMediaRequest("profile", currentUserId, "profile_avatar", "public", null, 0),
            cancellationToken);
    }

    public Task<AuthResult<MediaAssetDto>> UploadCompanyLogoAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        CancellationToken cancellationToken = default)
    {
        return UploadCoreAsync(
            currentUserId,
            currentUserRole,
            file,
            new UploadMediaRequest("company", null, "company_logo", "public", null, 0),
            cancellationToken);
    }

    public Task<AuthResult<MediaAssetDto>> UploadListingMediaAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid listingId,
        MediaFilePayload file,
        string? alt,
        int? sortOrder,
        CancellationToken cancellationToken = default)
    {
        return UploadCoreAsync(
            currentUserId,
            currentUserRole,
            file,
            new UploadMediaRequest("listing", listingId, "listing_image", "public", alt, sortOrder),
            cancellationToken);
    }

    public async Task<AuthResult<MediaAssetDto>> GetAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid mediaId,
        CancellationToken cancellationToken = default)
    {
        var mediaAsset = await dbContext.MediaAssets
            .AsNoTracking()
            .FirstOrDefaultAsync(
                asset => asset.Id == mediaId && asset.Status == MediaStatus.Active,
                cancellationToken);

        if (mediaAsset is null)
        {
            return AuthResult<MediaAssetDto>.Fail(404, "Media asset not found.", "MEDIA_NOT_FOUND");
        }

        if (mediaAsset.Visibility == MediaVisibility.Private
            && !IsAdmin(currentUserRole)
            && mediaAsset.OwnerUserId != currentUserId)
        {
            return AuthResult<MediaAssetDto>.Fail(403, "You do not have access to this media.", "MEDIA_ACCESS_FORBIDDEN");
        }

        return AuthResult<MediaAssetDto>.Ok(ToDto(mediaAsset));
    }

    public async Task<AuthResult<DeleteMediaResultDto>> DeleteAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid mediaId,
        CancellationToken cancellationToken = default)
    {
        var mediaAsset = await dbContext.MediaAssets
            .FirstOrDefaultAsync(
                asset => asset.Id == mediaId && asset.Status == MediaStatus.Active,
                cancellationToken);

        if (mediaAsset is null)
        {
            return AuthResult<DeleteMediaResultDto>.Fail(404, "Media asset not found.", "MEDIA_NOT_FOUND");
        }

        if (!IsAdmin(currentUserRole) && mediaAsset.OwnerUserId != currentUserId)
        {
            return AuthResult<DeleteMediaResultDto>.Fail(403, "You cannot delete this media asset.", "MEDIA_DELETE_FORBIDDEN");
        }

        await SoftDeleteMediaAssetAsync(mediaAsset, cancellationToken);

        return AuthResult<DeleteMediaResultDto>.Ok(
            new DeleteMediaResultDto(mediaAsset.Id, true),
            "Media deleted successfully.");
    }

    public async Task<AuthResult<DeleteMediaResultDto>> DeleteListingMediaAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid listingId,
        Guid mediaId,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == listingId && item.DeletedAt == null, cancellationToken);

        if (listing is null)
        {
            return AuthResult<DeleteMediaResultDto>.Fail(404, "Listing not found.", "LISTING_NOT_FOUND");
        }

        if (!IsAdmin(currentUserRole) && listing.SellerId != currentUserId)
        {
            return AuthResult<DeleteMediaResultDto>.Fail(403, "You cannot delete media from this listing.", "LISTING_MEDIA_DELETE_FORBIDDEN");
        }

        var mediaAsset = await dbContext.MediaAssets
            .FirstOrDefaultAsync(
                asset => asset.Id == mediaId
                    && asset.EntityType == "listing"
                    && asset.EntityId == listingId
                    && asset.Status == MediaStatus.Active,
                cancellationToken);

        if (mediaAsset is null)
        {
            return AuthResult<DeleteMediaResultDto>.Fail(404, "Media asset not found for this listing.", "LISTING_MEDIA_NOT_FOUND");
        }

        await SoftDeleteMediaAssetAsync(mediaAsset, cancellationToken);

        return AuthResult<DeleteMediaResultDto>.Ok(
            new DeleteMediaResultDto(mediaAsset.Id, true),
            "Listing media deleted successfully.");
    }

    private async Task<AuthResult<MediaAssetDto>> UploadCoreAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        UploadMediaRequest request,
        CancellationToken cancellationToken)
    {
        var validation = ValidateFile(file);
        if (validation is not null)
        {
            return validation;
        }

        var currentUser = await dbContext.Users
            .Include(user => user.Company)
            .FirstOrDefaultAsync(user => user.Id == currentUserId, cancellationToken);

        if (currentUser is null)
        {
            return AuthResult<MediaAssetDto>.Fail(401, "User not found.", "USER_NOT_FOUND");
        }

        if (!TryParseVisibility(request.Visibility, out var visibility))
        {
            return AuthResult<MediaAssetDto>.Fail(400, "Visibility is invalid.", "INVALID_MEDIA_VISIBILITY");
        }

        var entityType = NormalizeSlug(request.EntityType);
        var purpose = NormalizeSlug(request.Purpose);

        if (string.IsNullOrWhiteSpace(entityType) || string.IsNullOrWhiteSpace(purpose))
        {
            return AuthResult<MediaAssetDto>.Fail(400, "Entity type and purpose are required.", "INVALID_MEDIA_METADATA");
        }

        var targetResult = await ResolveUploadTargetAsync(
            currentUser,
            currentUserRole,
            entityType,
            request.EntityId,
            purpose,
            cancellationToken);

        if (!targetResult.Success)
        {
            return AuthResult<MediaAssetDto>.Fail(targetResult.StatusCode, targetResult.Message!, targetResult.Errors.ToArray());
        }

        var target = targetResult.Data!;
        var bucket = ResolveBucketName(visibility);
        if (string.IsNullOrWhiteSpace(bucket))
        {
            return AuthResult<MediaAssetDto>.Fail(500, "Storage bucket is not configured.", "STORAGE_BUCKET_NOT_CONFIGURED");
        }

        var mediaAssetId = Guid.NewGuid();
        var scopedEntityId = target.EntityId ?? currentUserId;
        var storagePath = BuildStoragePath(entityType, scopedEntityId, purpose, mediaAssetId, file.FileName);

        UploadedFileResult uploadResult;
        try
        {
            uploadResult = await storageService.UploadAsync(
                new MediaUploadCommand(bucket, storagePath, file.ContentType, file.Content, visibility),
                cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Supabase upload failed for entity type {EntityType} and purpose {Purpose}.", entityType, purpose);
            return AuthResult<MediaAssetDto>.Fail(502, "The file could not be uploaded.", "STORAGE_UPLOAD_FAILED");
        }

        var now = DateTime.UtcNow;
        var mediaAsset = new MediaAsset
        {
            Id = mediaAssetId,
            OwnerUserId = currentUserId,
            EntityType = entityType,
            EntityId = target.EntityId,
            Purpose = purpose,
            Bucket = uploadResult.Bucket,
            StoragePath = uploadResult.StoragePath,
            PublicUrl = uploadResult.PublicUrl,
            OriginalFileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            SizeBytes = file.SizeBytes,
            Alt = TrimOrNull(request.Alt),
            SortOrder = request.SortOrder,
            Visibility = visibility,
            Status = MediaStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.MediaAssets.Add(mediaAsset);
        ApplyUploadSideEffects(mediaAsset, target, file, now);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to persist media asset metadata for {StoragePath}.", storagePath);

            try
            {
                await storageService.DeleteAsync(uploadResult.Bucket, uploadResult.StoragePath, cancellationToken);
            }
            catch (Exception cleanupException)
            {
                logger.LogWarning(cleanupException, "Failed to rollback uploaded file {StoragePath} after persistence failure.", storagePath);
            }

            return AuthResult<MediaAssetDto>.Fail(500, "The media metadata could not be saved.", "MEDIA_METADATA_SAVE_FAILED");
        }

        return AuthResult<MediaAssetDto>.Ok(ToDto(mediaAsset), "Media uploaded successfully.");
    }

    private async Task<AuthResult<UploadTargetContext>> ResolveUploadTargetAsync(
        User currentUser,
        string currentUserRole,
        string entityType,
        Guid? entityId,
        string purpose,
        CancellationToken cancellationToken)
    {
        switch (entityType)
        {
            case "profile":
            {
                var targetUserId = entityId ?? currentUser.Id;
                if (!IsAdmin(currentUserRole) && targetUserId != currentUser.Id)
                {
                    return AuthResult<UploadTargetContext>.Fail(403, "You cannot upload media for another profile.", "PROFILE_MEDIA_FORBIDDEN");
                }

                var targetUser = targetUserId == currentUser.Id
                    ? currentUser
                    : await dbContext.Users.FirstOrDefaultAsync(user => user.Id == targetUserId, cancellationToken);

                if (targetUser is null)
                {
                    return AuthResult<UploadTargetContext>.Fail(404, "Profile owner not found.", "PROFILE_OWNER_NOT_FOUND");
                }

                return AuthResult<UploadTargetContext>.Ok(new UploadTargetContext(targetUserId, targetUser, null, null, purpose));
            }
            case "company":
            {
                Company? company;
                if (entityId.HasValue)
                {
                    company = await dbContext.Companies.FirstOrDefaultAsync(item => item.Id == entityId.Value, cancellationToken);
                }
                else
                {
                    company = currentUser.Company
                        ?? await dbContext.Companies.FirstOrDefaultAsync(item => item.UserId == currentUser.Id, cancellationToken);
                }

                if (company is null)
                {
                    return AuthResult<UploadTargetContext>.Fail(404, "Company profile not found.", "COMPANY_NOT_FOUND");
                }

                if (!IsAdmin(currentUserRole) && company.UserId != currentUser.Id)
                {
                    return AuthResult<UploadTargetContext>.Fail(403, "You cannot upload media for this company.", "COMPANY_MEDIA_FORBIDDEN");
                }

                return AuthResult<UploadTargetContext>.Ok(new UploadTargetContext(company.Id, null, company, null, purpose));
            }
            case "listing":
            {
                if (!entityId.HasValue)
                {
                    return AuthResult<UploadTargetContext>.Fail(400, "Listing id is required.", "LISTING_ID_REQUIRED");
                }

                var listing = await dbContext.Listings
                    .Include(item => item.Media)
                    .FirstOrDefaultAsync(item => item.Id == entityId.Value && item.DeletedAt == null, cancellationToken);

                if (listing is null)
                {
                    return AuthResult<UploadTargetContext>.Fail(404, "Listing not found.", "LISTING_NOT_FOUND");
                }

                if (!IsAdmin(currentUserRole))
                {
                    if (currentUser.Role != UserRole.Seller)
                    {
                        return AuthResult<UploadTargetContext>.Fail(403, "Only sellers can upload listing media.", "LISTING_MEDIA_ROLE_FORBIDDEN");
                    }

                    if (listing.SellerId != currentUser.Id)
                    {
                        return AuthResult<UploadTargetContext>.Fail(403, "You cannot upload media for this listing.", "LISTING_MEDIA_FORBIDDEN");
                    }
                }

                return AuthResult<UploadTargetContext>.Ok(new UploadTargetContext(listing.Id, null, null, listing, purpose));
            }
            default:
                return AuthResult<UploadTargetContext>.Ok(new UploadTargetContext(entityId, null, null, null, purpose));
        }
    }

    private void ApplyUploadSideEffects(
        MediaAsset mediaAsset,
        UploadTargetContext target,
        MediaFilePayload file,
        DateTime now)
    {
        if (mediaAsset.EntityType == "profile" && mediaAsset.Purpose == "profile_avatar" && target.TargetUser is not null)
        {
            target.TargetUser.AvatarUrl = mediaAsset.PublicUrl;
            target.TargetUser.UpdatedAt = DateTimeOffset.UtcNow;
        }

        if (mediaAsset.EntityType == "company" && mediaAsset.Purpose == "company_logo" && target.TargetCompany is not null)
        {
            target.TargetCompany.LogoUrl = mediaAsset.PublicUrl;
            target.TargetCompany.UpdatedAt = DateTimeOffset.UtcNow;
        }

        if (mediaAsset.EntityType == "listing"
            && mediaAsset.Purpose == "listing_image"
            && target.TargetListing is not null
            && mediaAsset.PublicUrl is not null)
        {
            var sortOrder = mediaAsset.SortOrder ?? target.TargetListing.Media.DefaultIfEmpty().Max(item => item?.SortOrder ?? -1) + 1;

            target.TargetListing.Media.Add(new ListingMedia
            {
                Id = mediaAsset.Id,
                ListingId = target.TargetListing.Id,
                Url = mediaAsset.PublicUrl,
                Alt = mediaAsset.Alt,
                Name = mediaAsset.OriginalFileName,
                SizeKb = Math.Round(file.SizeBytes / 1024m, 2),
                Type = mediaAsset.ContentType,
                SortOrder = sortOrder,
                CreatedAt = now,
                UpdatedAt = now
            });
        }
    }

    private async Task SoftDeleteMediaAssetAsync(MediaAsset mediaAsset, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        if (mediaAsset.EntityType == "profile" && mediaAsset.Purpose == "profile_avatar")
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(
                item => item.Id == (mediaAsset.EntityId ?? mediaAsset.OwnerUserId),
                cancellationToken);

            if (user is not null && string.Equals(user.AvatarUrl, mediaAsset.PublicUrl, StringComparison.OrdinalIgnoreCase))
            {
                user.AvatarUrl = null;
                user.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        if (mediaAsset.EntityType == "company" && mediaAsset.Purpose == "company_logo" && mediaAsset.EntityId.HasValue)
        {
            var company = await dbContext.Companies.FirstOrDefaultAsync(
                item => item.Id == mediaAsset.EntityId.Value,
                cancellationToken);

            if (company is not null && string.Equals(company.LogoUrl, mediaAsset.PublicUrl, StringComparison.OrdinalIgnoreCase))
            {
                company.LogoUrl = null;
                company.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        if (mediaAsset.EntityType == "listing" && mediaAsset.EntityId.HasValue)
        {
            var listingMedia = await dbContext.ListingMedia.FirstOrDefaultAsync(
                item => item.Id == mediaAsset.Id,
                cancellationToken);

            if (listingMedia is not null)
            {
                dbContext.ListingMedia.Remove(listingMedia);
            }
        }

        mediaAsset.Status = MediaStatus.Deleted;
        mediaAsset.DeletedAt = now;
        mediaAsset.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            await storageService.DeleteAsync(mediaAsset.Bucket, mediaAsset.StoragePath, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to delete file {StoragePath} from bucket {Bucket}.", mediaAsset.StoragePath, mediaAsset.Bucket);
        }
    }

    private static AuthResult<MediaAssetDto>? ValidateFile(MediaFilePayload file)
    {
        if (file.Content.Length == 0 || file.SizeBytes <= 0)
        {
            return AuthResult<MediaAssetDto>.Fail(400, "A file is required.", "FILE_REQUIRED");
        }

        if (file.SizeBytes > MaxFileSizeBytes)
        {
            return AuthResult<MediaAssetDto>.Fail(400, "The file exceeds the 5 MB limit.", "FILE_TOO_LARGE");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return AuthResult<MediaAssetDto>.Fail(400, "The file extension is not allowed.", "FILE_EXTENSION_NOT_ALLOWED");
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return AuthResult<MediaAssetDto>.Fail(400, "The content type is not allowed.", "FILE_CONTENT_TYPE_NOT_ALLOWED");
        }

        return null;
    }

    private string ResolveBucketName(MediaVisibility visibility)
    {
        return visibility == MediaVisibility.Public
            ? _supabaseOptions.PublicBucket
            : _supabaseOptions.PrivateBucket;
    }

    private static bool TryParseVisibility(string value, out MediaVisibility visibility)
    {
        visibility = value.Trim().Equals("private", StringComparison.OrdinalIgnoreCase)
            ? MediaVisibility.Private
            : MediaVisibility.Public;

        return value.Trim().Equals("private", StringComparison.OrdinalIgnoreCase)
            || value.Trim().Equals("public", StringComparison.OrdinalIgnoreCase);
    }

    private static string BuildStoragePath(
        string entityType,
        Guid scopedEntityId,
        string purpose,
        Guid assetId,
        string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var safeFileName = BuildSafeFileName(originalFileName, extension);

        return $"{entityType}/{scopedEntityId:D}/{purpose}/{assetId:D}-{safeFileName}";
    }

    private static string BuildSafeFileName(string originalFileName, string extension)
    {
        var rawName = Path.GetFileNameWithoutExtension(originalFileName);
        var normalized = new StringBuilder();
        var previousDash = false;

        foreach (var character in rawName.Normalize(NormalizationForm.FormD))
        {
            if (char.IsLetterOrDigit(character))
            {
                normalized.Append(char.ToLowerInvariant(character));
                previousDash = false;
                continue;
            }

            if (previousDash)
            {
                continue;
            }

            normalized.Append('-');
            previousDash = true;
        }

        var safeName = normalized.ToString().Trim('-');
        if (string.IsNullOrWhiteSpace(safeName))
        {
            safeName = "file";
        }

        return $"{safeName}{extension}";
    }

    private static string NormalizeSlug(string value)
    {
        return value.Trim().Replace(' ', '_').ToLowerInvariant();
    }

    private static bool IsAdmin(string currentUserRole)
    {
        return string.Equals(currentUserRole, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private static string? TrimOrNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static MediaAssetDto ToDto(MediaAsset mediaAsset)
    {
        return new MediaAssetDto(
            mediaAsset.Id,
            mediaAsset.OwnerUserId,
            mediaAsset.EntityType,
            mediaAsset.EntityId,
            mediaAsset.Purpose,
            mediaAsset.PublicUrl,
            mediaAsset.OriginalFileName,
            mediaAsset.ContentType,
            mediaAsset.SizeBytes,
            mediaAsset.Alt,
            mediaAsset.SortOrder,
            mediaAsset.Visibility == MediaVisibility.Public ? "public" : "private");
    }

    private sealed record UploadTargetContext(
        Guid? EntityId,
        User? TargetUser,
        Company? TargetCompany,
        Listing? TargetListing,
        string Purpose);
}
