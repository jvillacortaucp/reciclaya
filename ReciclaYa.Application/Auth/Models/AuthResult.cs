namespace ReciclaYa.Application.Auth.Models;

public sealed record AuthResult<T>(
    bool Success,
    T? Data,
    string? Message,
    IReadOnlyCollection<string> Errors,
    int StatusCode)
{
    public static AuthResult<T> Ok(T data, string? message = null)
    {
        return new AuthResult<T>(true, data, message, Array.Empty<string>(), 200);
    }

    public static AuthResult<T> Fail(int statusCode, string message, params string[] errors)
    {
        return new AuthResult<T>(false, default, message, errors, statusCode);
    }
}
