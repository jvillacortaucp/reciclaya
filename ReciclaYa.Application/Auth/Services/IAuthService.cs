using ReciclaYa.Application.Auth.Dtos;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Auth.Requests;

namespace ReciclaYa.Application.Auth.Services;

public interface IAuthService
{
    Task<AuthResult<AuthSessionDto>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult<AuthSessionDto>> RegisterCompanyAsync(RegisterCompanyRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult<AuthSessionDto>> RegisterPersonAsync(RegisterPersonRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult<AuthSessionDto>> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    Task<AuthResult<MeDto>> GetMeAsync(Guid userId, CancellationToken cancellationToken = default);
}
