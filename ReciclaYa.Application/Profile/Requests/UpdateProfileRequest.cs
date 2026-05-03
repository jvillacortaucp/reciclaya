namespace ReciclaYa.Application.Profile.Requests;

public sealed record UpdateProfileRequest(
    string? FullName,
    string? MobilePhone,
    string? Address,
    string? PostalCode,
    UpdateCompanyProfileRequest? Company,
    UpdatePersonProfileRequest? PersonProfile);

public sealed record UpdateCompanyProfileRequest(
    string? BusinessName,
    string? MobilePhone,
    string? Address,
    string? PostalCode,
    string? LegalRepresentative,
    string? Position);

public sealed record UpdatePersonProfileRequest(
    string? FirstName,
    string? LastName,
    string? MobilePhone,
    string? Address,
    string? PostalCode);
