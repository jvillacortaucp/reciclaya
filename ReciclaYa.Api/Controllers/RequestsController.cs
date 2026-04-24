using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.CommercialRequests.Dtos;
using ReciclaYa.Application.CommercialRequests.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/requests")]
public sealed class RequestsController(ICommercialRequestService commercialRequestService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRequests(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        var requests = await commercialRequestService.GetRequestsAsync(userId, role, cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<CommercialRequestDto>>.Ok(requests));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        var request = await commercialRequestService.GetByIdAsync(id, userId, role, cancellationToken);

        return request is null
            ? NotFound(ApiResponse<object>.Fail("Request not found.", ["REQUEST_NOT_FOUND"]))
            : Ok(ApiResponse<CommercialRequestDto>.Ok(request));
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCommercialRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!IsBuyer(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var created = await commercialRequestService.CreateAsync(userId, request, cancellationToken);

            return Ok(ApiResponse<CommercialRequestDto>.Ok(created, "Request created."));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPatch("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteSellerActionAsync(
            id,
            cancellationToken,
            (requestId, sellerId, token) => commercialRequestService.AcceptAsync(requestId, sellerId, token),
            "Request accepted.");
    }

    [HttpPatch("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken)
    {
        return await ExecuteSellerActionAsync(
            id,
            cancellationToken,
            (requestId, sellerId, token) => commercialRequestService.RejectAsync(requestId, sellerId, token),
            "Request rejected.");
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!IsBuyer(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var request = await commercialRequestService.CancelAsync(id, userId, cancellationToken);

            return request is null
                ? NotFound(ApiResponse<object>.Fail("Request not found.", ["REQUEST_NOT_FOUND"]))
                : Ok(ApiResponse<CommercialRequestDto>.Ok(request, "Request cancelled."));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    private async Task<IActionResult> ExecuteSellerActionAsync(
        Guid id,
        CancellationToken cancellationToken,
        Func<Guid, Guid, CancellationToken, Task<CommercialRequestDto?>> action,
        string successMessage)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        if (!IsSeller(role))
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<object>.Fail("Forbidden.", ["FORBIDDEN"]));
        }

        try
        {
            var request = await action(id, userId, cancellationToken);

            return request is null
                ? NotFound(ApiResponse<object>.Fail("Request not found.", ["REQUEST_NOT_FOUND"]))
                : Ok(ApiResponse<CommercialRequestDto>.Ok(request, successMessage));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    private static IActionResult MapInvalidOperation(InvalidOperationException exception)
    {
        if (exception.Message.Contains("own listing", StringComparison.OrdinalIgnoreCase)
            || exception.Message.Contains("only cancel your own", StringComparison.OrdinalIgnoreCase)
            || exception.Message.Contains("only respond", StringComparison.OrdinalIgnoreCase))
        {
            return new ObjectResult(ApiResponse<object>.Fail(exception.Message, ["FORBIDDEN"]))
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        return new BadRequestObjectResult(
            ApiResponse<object>.Fail(exception.Message, ["INVALID_REQUEST_OPERATION"]));
    }

    private static bool IsBuyer(string role)
    {
        return string.Equals(role, "buyer", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsSeller(string role)
    {
        return string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase);
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId)
            && !string.IsNullOrWhiteSpace(role);
    }
}
