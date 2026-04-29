using System.Net;
using ReciclaYa.Api.Responses;

namespace ReciclaYa.Api.Middleware;

public sealed class ApiExceptionMiddleware(
    RequestDelegate next,
    ILogger<ApiExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Unhandled API error. Path={Path}, Method={Method}, TraceId={TraceId}",
                context.Request.Path,
                context.Request.Method,
                context.TraceIdentifier);

            context.Response.ContentType = "application/json";

            var (statusCode, message, errors) = exception switch
            {
                InvalidOperationException => (
                    (int)HttpStatusCode.BadRequest,
                    "No se pudo procesar la solicitud.",
                    new[] { exception.Message }),
                ArgumentException => (
                    (int)HttpStatusCode.BadRequest,
                    "Los datos enviados no son válidos.",
                    new[] { exception.Message }),
                _ => (
                    (int)HttpStatusCode.InternalServerError,
                    "Ocurrió un error interno. Inténtalo nuevamente.",
                    new[] { "UNHANDLED_SERVER_ERROR" })
            };

            context.Response.StatusCode = statusCode;
            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(message, errors));
        }
    }
}
