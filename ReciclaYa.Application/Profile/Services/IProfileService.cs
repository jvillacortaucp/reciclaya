using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Profile.Dtos;
using ReciclaYa.Application.Profile.Requests;

namespace ReciclaYa.Application.Profile.Services;

public interface IProfileService
{
    Task<AuthResult<ProfileDto>> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<AuthResult<ProfileDto>> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default);
}
