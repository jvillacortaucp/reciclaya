using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.ValorizationIdeas.Dtos;
using ReciclaYa.Application.ValorizationIdeas.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/valorization-ideas")]
public sealed class ValorizationIdeasPreviewController(IValorizationIdeaService valorizationIdeaService) : ControllerBase
{
    [HttpPost("preview")]
    public async Task<IActionResult> Preview(
        [FromBody] WasteSellRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!CanPreviewIdeas())
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var ideas = await valorizationIdeaService.PreviewAsync(request, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<ValorizationIdeaDto>>.Ok(ideas));
    }

    private bool CanPreviewIdeas()
    {
        var role = User.FindFirst("role")?.Value;

        return string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }
}
