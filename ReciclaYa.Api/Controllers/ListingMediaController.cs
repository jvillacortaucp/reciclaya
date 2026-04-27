using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/listings/{listingId:guid}/media")]
public sealed class ListingMediaController(IMediaService mediaService) : ControllerBase
{
    [HttpPost("upload")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        Guid listingId,
        [FromForm] IFormFile? file,
        [FromForm] string? alt,
        [FromForm] int? sortOrder,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var payload = await ToFilePayloadAsync(file, cancellationToken);
        if (payload is null)
        {
            return BadRequest(ApiResponse<object>.Fail("A file is required.", ["FILE_REQUIRED"]));
        }

        var result = await mediaService.UploadListingMediaAsync(
            userId,
            GetRole(),
            listingId,
            payload,
            alt,
            sortOrder,
            cancellationToken);

        return ToActionResult(result);
    }

    [HttpDelete("{mediaId:guid}")]
    public async Task<IActionResult> Delete(Guid listingId, Guid mediaId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var result = await mediaService.DeleteListingMediaAsync(
            userId,
            GetRole(),
            listingId,
            mediaId,
            cancellationToken);

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
