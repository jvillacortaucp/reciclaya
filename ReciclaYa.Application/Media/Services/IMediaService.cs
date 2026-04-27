using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Dtos;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Requests;

namespace ReciclaYa.Application.Media.Services;

public interface IMediaService
{
    Task<AuthResult<MediaAssetDto>> UploadAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        UploadMediaRequest request,
        CancellationToken cancellationToken = default);

    Task<AuthResult<MediaAssetDto>> UploadProfileAvatarAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        CancellationToken cancellationToken = default);

    Task<AuthResult<MediaAssetDto>> UploadCompanyLogoAsync(
        Guid currentUserId,
        string currentUserRole,
        MediaFilePayload file,
        CancellationToken cancellationToken = default);

    Task<AuthResult<MediaAssetDto>> UploadListingMediaAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid listingId,
        MediaFilePayload file,
        string? alt,
        int? sortOrder,
        CancellationToken cancellationToken = default);

    Task<AuthResult<MediaAssetDto>> GetAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid mediaId,
        CancellationToken cancellationToken = default);

    Task<AuthResult<DeleteMediaResultDto>> DeleteAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid mediaId,
        CancellationToken cancellationToken = default);

    Task<AuthResult<DeleteMediaResultDto>> DeleteListingMediaAsync(
        Guid currentUserId,
        string currentUserRole,
        Guid listingId,
        Guid mediaId,
        CancellationToken cancellationToken = default);
}
