using ReciclaYa.Application.Auth.Models;

namespace ReciclaYa.Api.Responses;

public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message,
    IReadOnlyCollection<string> Errors)
{
    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>(true, data, message, Array.Empty<string>());
    }

    public static ApiResponse<T> Fail(string message, IReadOnlyCollection<string> errors)
    {
        return new ApiResponse<T>(false, default, message, errors);
    }

    public static ApiResponse<T> FromResult(AuthResult<T> result)
    {
        return result.Success
            ? Ok(result.Data!, result.Message)
            : Fail(result.Message ?? "Request failed.", result.Errors);
    }
}
