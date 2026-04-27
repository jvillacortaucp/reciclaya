namespace ReciclaYa.Application.Profile.Dtos;

public sealed record ProfileDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    string ProfileType,
    string Status,
    string? AvatarUrl,
    ProfileCompanyDto? Company,
    ProfilePersonDto? PersonProfile);

public sealed record ProfileCompanyDto(
    Guid Id,
    string Ruc,
    string BusinessName,
    string? LogoUrl,
    string MobilePhone,
    string Address,
    string PostalCode,
    string LegalRepresentative,
    string Position,
    string VerificationStatus);

public sealed record ProfilePersonDto(
    Guid Id,
    string FirstName,
    string LastName,
    string DocumentNumber,
    string MobilePhone,
    string Address,
    string PostalCode,
    string VerificationStatus);
