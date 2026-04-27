namespace ReciclaYa.Application.Admin.Dtos;

public sealed record AdminCompanyDto(
    Guid Id,
    string BusinessName,
    string Ruc,
    string VerificationStatus,
    DateTimeOffset CreatedAt);
