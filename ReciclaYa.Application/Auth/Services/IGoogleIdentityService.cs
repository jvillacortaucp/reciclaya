namespace ReciclaYa.Application.Auth.Services;

public interface IGoogleIdentityService
{
    Task<GoogleUserInfo?> ExchangeCodeForUserAsync(string code, CancellationToken cancellationToken = default);
}

public sealed record GoogleUserInfo(
    string Email,
    string? Name,
    string? PictureUrl,
    bool EmailVerified);
