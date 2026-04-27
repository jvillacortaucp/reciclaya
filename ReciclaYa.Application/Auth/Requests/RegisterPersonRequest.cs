namespace ReciclaYa.Application.Auth.Requests;

public sealed record RegisterPersonRequest(
    string Email,
    string Password,
    string ConfirmPassword,
    string Intent,
    string FirstName,
    string LastName,
    string DocumentNumber,
    string MobilePhone,
    string Address,
    string PostalCode);
