using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Requests;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Services;
using ReciclaYa.Application.Profile.Requests;
using ReciclaYa.Application.Profile.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController(
    IProfileService profileService,
    IMediaService mediaService) : ControllerBase
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

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar(
        [FromForm] UploadAvatarFormRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var role = User.FindFirst("role")?.Value ?? string.Empty;
        var payload = await ToFilePayloadAsync(request.File, cancellationToken);
        if (payload is null)
        {
            return BadRequest(ApiResponse<object>.Fail("A file is required.", ["FILE_REQUIRED"]));
        }

        var result = await mediaService.UploadProfileAvatarAsync(userId, role, payload, cancellationToken);

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

    private static async Task<MediaFilePayload?> ToFilePayloadAsync(
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length <= 0)
        {
            return null;
        }

        await using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);

        return new MediaFilePayload(
            file.FileName,
            file.ContentType,
            file.Length,
            memoryStream.ToArray());
    }
}
