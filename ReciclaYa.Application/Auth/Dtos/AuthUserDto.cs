namespace ReciclaYa.Application.Auth.Dtos;

public sealed record AuthUserDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    string ProfileType,
    string Status,
    string? AvatarUrl);
