namespace ReciclaYa.Application.Auth.Requests;

public sealed record RegisterCompanyRequest(
    string Email,
    string Password,
    string ConfirmPassword,
    string Intent,
    CompanyRegistrationData Company);

public sealed record CompanyRegistrationData(
    string Ruc,
    string BusinessName,
    string MobilePhone,
    string Address,
    string PostalCode,
    string LegalRepresentative,
    string Position);
