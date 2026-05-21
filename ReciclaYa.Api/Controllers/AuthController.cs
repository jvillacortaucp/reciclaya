using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Dtos;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Auth.Requests;
using ReciclaYa.Application.Auth.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    IAuthService authService,
    IMemoryCache cache,
    IOptions<GoogleAuthSettings> googleOptions) : ControllerBase
{
    private const string GoogleTicketPrefix = "google-session-ticket:";
    private readonly GoogleAuthSettings _googleSettings = googleOptions.Value;
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("register/company")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterCompany(
        [FromBody] RegisterCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterCompanyAsync(request, cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("register/person")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterPerson(
        [FromBody] RegisterPersonRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterPersonAsync(request, cancellationToken);

        return ToActionResult(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(request, cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(subject, out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await authService.GetMeAsync(userId, cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet("google/start")]
    [AllowAnonymous]
    public IActionResult StartGoogle([FromQuery] string? returnUrl = null)
    {
        try
        {
            var url = authService.BuildGoogleStartUrl(returnUrl);
            return Redirect(url);
        }
        catch
        {
            var errorUrl = string.IsNullOrWhiteSpace(_googleSettings.FrontendErrorUrl)
                ? "http://localhost:4200/auth/login"
                : _googleSettings.FrontendErrorUrl;
            var separator = errorUrl.Contains('?') ? "&" : "?";
            return Redirect($"{errorUrl}{separator}auth=error&code=GOOGLE_OAUTH_NOT_CONFIGURED");
        }
    }

    [HttpGet("google/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback(
        [FromQuery] string? code = null,
        [FromQuery] string? state = null,
        CancellationToken cancellationToken = default)
    {
        var result = await authService.LoginWithGoogleCodeAsync(code ?? string.Empty, state, cancellationToken);
        if (!result.Success || result.Data is null)
        {
            var errorCode = result.Errors.FirstOrDefault() ?? "GOOGLE_OAUTH_FAILED";
            var errorUrl = string.IsNullOrWhiteSpace(_googleSettings.FrontendErrorUrl)
                ? "http://localhost:4200/auth/login"
                : _googleSettings.FrontendErrorUrl;

            var separator = errorUrl.Contains('?') ? "&" : "?";
            return Redirect($"{errorUrl}{separator}auth=error&code={Uri.EscapeDataString(errorCode)}");
        }

        var ticket = Guid.NewGuid().ToString("N");
        cache.Set($"{GoogleTicketPrefix}{ticket}", result.Data, TimeSpan.FromMinutes(2));

        var successUrl = string.IsNullOrWhiteSpace(_googleSettings.FrontendSuccessUrl)
            ? "http://localhost:4200/auth/login"
            : _googleSettings.FrontendSuccessUrl;
        var successSeparator = successUrl.Contains('?') ? "&" : "?";
        return Redirect($"{successUrl}{successSeparator}auth=success&ticket={Uri.EscapeDataString(ticket)}");
    }

    [HttpPost("google/exchange")]
    [AllowAnonymous]
    public IActionResult ExchangeGoogleSession([FromBody] GoogleSessionExchangeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Ticket))
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid ticket.", ["INVALID_GOOGLE_TICKET"]));
        }

        var cacheKey = $"{GoogleTicketPrefix}{request.Ticket.Trim()}";
        if (!cache.TryGetValue<AuthSessionDto>(cacheKey, out var session) || session is null)
        {
            return Unauthorized(ApiResponse<object>.Fail("Google session ticket expired or invalid.", ["INVALID_GOOGLE_TICKET"]));
        }

        cache.Remove(cacheKey);
        return Ok(ApiResponse<AuthSessionDto>.Ok(session));
    }

    private IActionResult ToActionResult<T>(AuthResult<T> result)
    {
        var response = ApiResponse<T>.FromResult(result);

        return StatusCode(result.StatusCode, response);
    }
}
