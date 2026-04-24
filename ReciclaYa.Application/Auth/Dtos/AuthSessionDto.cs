namespace ReciclaYa.Application.Auth.Dtos;

public sealed record AuthSessionDto(
    string Token,
    string RefreshToken,
    DateTimeOffset ExpiresAt,
    AuthUserDto User,
    IReadOnlyCollection<string> Permissions);
