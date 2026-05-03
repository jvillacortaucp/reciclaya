using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Requests;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Media.Models;
using ReciclaYa.Application.Media.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/companies")]
public sealed class CompaniesController(IMediaService mediaService) : ControllerBase
{
    [HttpPost("me/logo")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadLogo(
        [FromForm] UploadLogoFormRequest request,
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

        var result = await mediaService.UploadCompanyLogoAsync(userId, GetRole(), payload, cancellationToken);

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
