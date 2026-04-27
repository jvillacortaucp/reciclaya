using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Requests;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Requests;
using ReciclaYa.Application.Media.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/media")]
public sealed class MediaController(IMediaService mediaService) : ControllerBase
{
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        [FromForm] UploadMediaFormRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var payload = await ToFilePayloadAsync(request.File, cancellationToken);
        if (payload is null)
        {
            return BadRequest(ApiResponse<object>.Fail("A file is required.", ["FILE_REQUIRED"]));
        }

        var result = await mediaService.UploadAsync(
            userId,
            GetRole(),
            payload,
            new UploadMediaRequest(
                request.EntityType,
                request.EntityId,
                request.Purpose,
                request.Visibility,
                request.Alt,
                request.SortOrder),
            cancellationToken);

        return ToActionResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await mediaService.GetAsync(userId, GetRole(), id, cancellationToken);

        return ToActionResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await mediaService.DeleteAsync(userId, GetRole(), id, cancellationToken);

        return ToActionResult(result);
    }

    private string GetRole()
    {
        return User.FindFirst("role")?.Value ?? string.Empty;
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
