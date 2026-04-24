namespace ReciclaYa.Application.Auth.Models;

public sealed class JwtSettings
{
    public string Secret { get; init; } = string.Empty;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public int ExpiresMinutes { get; init; }

    public int RefreshTokenExpiresDays { get; init; }
}
