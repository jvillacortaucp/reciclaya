namespace ReciclaYa.Application.Auth.Dtos;

public sealed record MeDto(AuthUserDto User, IReadOnlyCollection<string> Permissions);
