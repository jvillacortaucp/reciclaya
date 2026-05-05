using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Recommendations.Dtos;
using ReciclaYa.Application.Recommendations.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/recommendations")]
public sealed class RecommendationsController(IRecommendationService recommendationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRecommendations(
        [FromQuery] int? limit = 5,
        [FromQuery] bool useAi = true,
        [FromQuery] bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var recommendations = await recommendationService.GetRecommendationsAsync(
            userId,
            IsAdmin(role),
            NormalizeLimit(limit),
            useAi,
            includeExplanation,
            cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<RecommendationDto>>.Ok(recommendations));
    }

    [HttpGet("listings/{listingId:guid}/analysis")]
    public async Task<IActionResult> GetListingAnalysis(
        Guid listingId,
        [FromQuery] string? selectedProductId = null,
        [FromQuery] bool useAi = true,
        [FromQuery] bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.GetListingAnalysisAsync(
            userId,
            IsAdmin(role),
            listingId,
            selectedProductId,
            useAi,
            includeExplanation,
            cancellationToken);

        if (analysis is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto>.Ok(analysis));
    }

    [HttpPost("listings/{listingId:guid}/analysis/save")]
    public async Task<IActionResult> SaveListingAnalysis(
        Guid listingId,
        [FromQuery] string? selectedProductId = null,
        [FromQuery] bool useAi = true,
        [FromQuery] bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.SaveListingAnalysisAsync(
            userId,
            IsAdmin(role),
            listingId,
            selectedProductId,
            useAi,
            includeExplanation,
            cancellationToken);

        if (analysis is null)
        {
            return NotFound(ApiResponse<object>.Fail("Listing not found.", ["LISTING_NOT_FOUND"]));
        }

        return Ok(ApiResponse<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto>.Ok(analysis));
    }

    [HttpGet("listings/{listingId:guid}/analysis/latest")]
    public async Task<IActionResult> GetLatestListingAnalysis(
        Guid listingId,
        [FromQuery] string? selectedProductId = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.GetLatestListingAnalysisAsync(
            listingId,
            selectedProductId,
            cancellationToken);

        if (analysis is null)
        {
            return NotFound(ApiResponse<object>.Fail("Analysis not found.", ["ANALYSIS_NOT_FOUND"]));
        }

        return Ok(ApiResponse<RecommendationAnalysisRecordDto>.Ok(analysis));
    }

    [HttpGet("listings/{listingId:guid}/analysis/history")]
    public async Task<IActionResult> GetListingAnalysisHistory(
        Guid listingId,
        [FromQuery] string? selectedProductId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out _, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var history = await recommendationService.GetListingAnalysisHistoryAsync(
            listingId,
            selectedProductId,
            page,
            pageSize,
            cancellationToken);

        return Ok(ApiResponse<RecommendationAnalysisHistoryPageDto>.Ok(history));
    }

    [HttpPost("chatbot-analysis")]
    public async Task<IActionResult> GetChatbotAnalysis(
        [FromBody] ChatbotRecommendationAnalysisRequestDto request,
        [FromQuery] bool useAi = true,
        [FromQuery] bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.GetChatbotAnalysisAsync(
            userId,
            request,
            useAi,
            includeExplanation,
            cancellationToken);

        return Ok(ApiResponse<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto>.Ok(analysis));
    }

    [HttpPost("chatbot-analysis/save")]
    public async Task<IActionResult> SaveChatbotAnalysis(
        [FromBody] ChatbotRecommendationAnalysisRequestDto request,
        [FromQuery] bool useAi = true,
        [FromQuery] bool includeExplanation = true,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.SaveChatbotAnalysisAsync(
            userId,
            request,
            useAi,
            includeExplanation,
            cancellationToken);

        return Ok(ApiResponse<ReciclaYa.Application.ValueSectors.Dtos.ValueRouteDetailDto>.Ok(analysis));
    }

    [HttpGet("chatbot-analysis/latest")]
    public async Task<IActionResult> GetLatestChatbotAnalysis(
        [FromQuery] string productId,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var analysis = await recommendationService.GetLatestChatbotAnalysisAsync(userId, productId, cancellationToken);
        if (analysis is null)
        {
            return NotFound(ApiResponse<object>.Fail("Analysis not found.", ["ANALYSIS_NOT_FOUND"]));
        }

        return Ok(ApiResponse<RecommendationAnalysisRecordDto>.Ok(analysis));
    }

    [HttpGet("chatbot-analysis/history")]
    public async Task<IActionResult> GetChatbotAnalysisHistory(
        [FromQuery] string productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var history = await recommendationService.GetChatbotAnalysisHistoryAsync(
            userId,
            productId,
            page,
            pageSize,
            cancellationToken);

        return Ok(ApiResponse<RecommendationAnalysisHistoryPageDto>.Ok(history));
    }

    [HttpGet("analyses/my")]
    public async Task<IActionResult> GetMyAnalyses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!CanUseRecommendations(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        var history = await recommendationService.GetMyAnalysesAsync(
            userId,
            page,
            pageSize,
            cancellationToken);

        return Ok(ApiResponse<RecommendationAnalysisHistoryPageDto>.Ok(history));
    }

    private static bool CanUseRecommendations(string role)
    {
        return string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAdmin(string role)
    {
        return string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId)
            && !string.IsNullOrWhiteSpace(role);
    }

    private static int NormalizeLimit(int? limit)
    {
        if (!limit.HasValue)
        {
            return 5;
        }

        return Math.Clamp(limit.Value, 1, 10);
    }
}
