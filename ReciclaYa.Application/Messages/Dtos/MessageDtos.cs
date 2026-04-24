namespace ReciclaYa.Application.Messages.Dtos;

public sealed record CreateMessageDto(
    string Body);

public sealed record MessageThreadListItemDto(
    Guid Id,
    Guid? CommercialRequestId,
    Guid ListingId,
    string ListingTitle,
    string BuyerName,
    string SellerName,
    string LastMessagePreview,
    DateTime? LastMessageAt,
    int UnreadCount,
    string Status);

public sealed record MessageThreadListingDto(
    Guid Id,
    string Title,
    decimal Quantity,
    string Unit);

public sealed record MessageItemDto(
    Guid Id,
    Guid SenderId,
    string SenderName,
    string Body,
    DateTime CreatedAt,
    DateTime? ReadAt,
    bool IsMine);

public sealed record MessageThreadDetailDto(
    Guid Id,
    Guid? CommercialRequestId,
    MessageThreadListingDto Listing,
    string BuyerName,
    string SellerName,
    string Status,
    IReadOnlyCollection<MessageItemDto> Messages);

public sealed record MarkThreadReadResultDto(
    Guid ThreadId,
    int UpdatedCount);
