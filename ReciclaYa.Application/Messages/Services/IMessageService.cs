using ReciclaYa.Application.Messages.Dtos;

namespace ReciclaYa.Application.Messages.Services;

public interface IMessageService
{
    Task<IReadOnlyCollection<MessageThreadListItemDto>> GetThreadsAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<MessageThreadDetailDto?> GetThreadAsync(
        Guid threadId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<MessageThreadDetailDto> GetOrCreateFromRequestAsync(
        Guid requestId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<MessageItemDto> SendMessageAsync(
        Guid threadId,
        Guid userId,
        string role,
        CreateMessageDto request,
        CancellationToken cancellationToken = default);

    Task<MarkThreadReadResultDto> MarkAsReadAsync(
        Guid threadId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);
}
