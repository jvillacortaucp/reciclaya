using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.Auth.Services;

public interface IJwtTokenService
{
    GeneratedAccessToken GenerateAccessToken(User user);

    string GenerateRefreshToken();
}
