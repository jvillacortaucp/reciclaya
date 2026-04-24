using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Profile.Requests;
using ReciclaYa.Application.Profile.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await profileService.GetProfileAsync(userId, cancellationToken);

        return ToActionResult(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await profileService.UpdateProfileAsync(userId, request, cancellationToken);

        return ToActionResult(result);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        return Guid.TryParse(subject, out userId);
    }

    private IActionResult ToActionResult<T>(AuthResult<T> result)
    {
        var response = ApiResponse<T>.FromResult(result);

        return StatusCode(result.StatusCode, response);
    }
}
