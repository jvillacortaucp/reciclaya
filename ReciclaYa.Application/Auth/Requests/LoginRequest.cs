namespace ReciclaYa.Application.Auth.Requests;

public sealed record LoginRequest(
    string Email,
    string Password,
    bool RememberMe);
