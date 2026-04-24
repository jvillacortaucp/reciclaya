using System.IdentityModel.Tokens.Jwt;
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
public sealed class AuthController(IAuthService authService) : ControllerBase
{
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

    private IActionResult ToActionResult<T>(AuthResult<T> result)
    {
        var response = ApiResponse<T>.FromResult(result);

        return StatusCode(result.StatusCode, response);
    }
}
