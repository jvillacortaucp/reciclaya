using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Messages.Dtos;
using ReciclaYa.Application.Messages.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/messages")]
public sealed class MessagesController(IMessageService messageService) : ControllerBase
{
    [HttpGet("threads")]
    public async Task<IActionResult> GetThreads(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        var threads = await messageService.GetThreadsAsync(userId, role, cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<MessageThreadListItemDto>>.Ok(threads));
    }

    [HttpGet("threads/{threadId:guid}")]
    public async Task<IActionResult> GetThread(Guid threadId, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        try
        {
            var thread = await messageService.GetThreadAsync(threadId, userId, role, cancellationToken);

            return thread is null
                ? NotFound(ApiResponse<object>.Fail("Message thread not found.", ["THREAD_NOT_FOUND"]))
                : Ok(ApiResponse<MessageThreadDetailDto>.Ok(thread));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPost("threads/{threadId:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid threadId,
        [FromBody] CreateMessageDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        try
        {
            var message = await messageService.SendMessageAsync(threadId, userId, role, request, cancellationToken);

            return Ok(ApiResponse<MessageItemDto>.Ok(message, "Message sent."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, ["THREAD_NOT_FOUND"]));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPost("from-request/{requestId:guid}")]
    public async Task<IActionResult> GetOrCreateFromRequest(Guid requestId, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        try
        {
            var thread = await messageService.GetOrCreateFromRequestAsync(requestId, userId, role, cancellationToken);

            return Ok(ApiResponse<MessageThreadDetailDto>.Ok(thread));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, ["REQUEST_NOT_FOUND"]));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    [HttpPatch("threads/{threadId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid threadId, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN"]));
        }

        try
        {
            var result = await messageService.MarkAsReadAsync(threadId, userId, role, cancellationToken);

            return Ok(ApiResponse<MarkThreadReadResultDto>.Ok(result, "Thread marked as read."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, ["THREAD_NOT_FOUND"]));
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperation(ex);
        }
    }

    private static IActionResult MapInvalidOperation(InvalidOperationException exception)
    {
        if (exception.Message.Contains("access", StringComparison.OrdinalIgnoreCase))
        {
            return new ObjectResult(ApiResponse<object>.Fail(exception.Message, ["FORBIDDEN"]))
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }

        return new BadRequestObjectResult(
            ApiResponse<object>.Fail(exception.Message, ["INVALID_MESSAGE_OPERATION"]));
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId)
            && !string.IsNullOrWhiteSpace(role);
    }
}
