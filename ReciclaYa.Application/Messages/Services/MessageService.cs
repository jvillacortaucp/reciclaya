using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Messages.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Messages.Services;

public sealed class MessageService(IAuthDbContext dbContext) : IMessageService
{
    public async Task<IReadOnlyCollection<MessageThreadListItemDto>> GetThreadsAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var threads = await BuildScopedThreadQuery(userId, role)
            .Include(thread => thread.CommercialRequest)
            .Include(thread => thread.Listing)
            .Include(thread => thread.Buyer)
                .ThenInclude(user => user.Company)
            .Include(thread => thread.Seller)
                .ThenInclude(user => user.Company)
            .Include(thread => thread.Messages)
            .OrderByDescending(thread => thread.LastMessageAt)
            .ThenByDescending(thread => thread.CreatedAt)
            .ToListAsync(cancellationToken);

        return threads
            .Select(thread => ToListItemDto(thread, userId))
            .ToArray();
    }

    public async Task<MessageThreadDetailDto?> GetThreadAsync(
        Guid threadId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var thread = await GetThreadQuery()
            .FirstOrDefaultAsync(item => item.Id == threadId, cancellationToken);

        if (thread is null)
        {
            return null;
        }

        EnsureCanAccessThread(thread, userId, role);

        return ToDetailDto(thread, userId);
    }

    public async Task<MessageThreadDetailDto> GetOrCreateFromRequestAsync(
        Guid requestId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var request = await dbContext.CommercialRequests
            .Include(item => item.Listing)
            .Include(item => item.Buyer)
                .ThenInclude(user => user.Company)
            .Include(item => item.Seller)
                .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(item => item.Id == requestId, cancellationToken);

        if (request is null)
        {
            throw new KeyNotFoundException("Commercial request not found.");
        }

        EnsureCanAccessRequest(request, userId, role);

        var existingThread = await GetThreadQuery(track: true)
            .FirstOrDefaultAsync(item => item.CommercialRequestId == requestId, cancellationToken);

        if (existingThread is not null)
        {
            return ToDetailDto(existingThread, userId);
        }

        var now = DateTime.UtcNow;
        var thread = new MessageThread
        {
            Id = Guid.NewGuid(),
            CommercialRequestId = request.Id,
            ListingId = request.ListingId,
            BuyerId = request.BuyerId,
            SellerId = request.SellerId,
            Status = MessageThreadStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
            LastMessageAt = null,
            CommercialRequest = request,
            Listing = request.Listing,
            Buyer = request.Buyer,
            Seller = request.Seller
        };

        dbContext.MessageThreads.Add(thread);
        await dbContext.SaveChangesAsync(cancellationToken);

        var createdThread = await GetThreadQuery()
            .FirstAsync(item => item.Id == thread.Id, cancellationToken);

        return ToDetailDto(createdThread, userId);
    }

    public async Task<MessageItemDto> SendMessageAsync(
        Guid threadId,
        Guid userId,
        string role,
        CreateMessageDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
        {
            throw new InvalidOperationException("Message body is required.");
        }

        if (request.Body.Length > 2000)
        {
            throw new InvalidOperationException("Message body cannot exceed 2000 characters.");
        }

        var thread = await GetThreadQuery(track: true)
            .FirstOrDefaultAsync(item => item.Id == threadId, cancellationToken);

        if (thread is null)
        {
            throw new KeyNotFoundException("Message thread not found.");
        }

        EnsureCanAccessThread(thread, userId, role);

        var sender = await dbContext.Users
            .Include(user => user.Company)
            .FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);

        if (sender is null)
        {
            throw new InvalidOperationException("Sender not found.");
        }

        var now = DateTime.UtcNow;
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ThreadId = thread.Id,
            SenderId = userId,
            Body = request.Body.Trim(),
            CreatedAt = now,
            Sender = sender,
            Thread = thread
        };

        thread.LastMessageAt = now;
        thread.UpdatedAt = now;

        dbContext.Messages.Add(message);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToMessageDto(message, userId);
    }

    public async Task<MarkThreadReadResultDto> MarkAsReadAsync(
        Guid threadId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var thread = await GetThreadQuery(track: true)
            .FirstOrDefaultAsync(item => item.Id == threadId, cancellationToken);

        if (thread is null)
        {
            throw new KeyNotFoundException("Message thread not found.");
        }

        EnsureCanAccessThread(thread, userId, role);

        var now = DateTime.UtcNow;
        var unreadMessages = thread.Messages
            .Where(message => message.SenderId != userId && message.ReadAt is null)
            .ToArray();

        foreach (var message in unreadMessages)
        {
            message.ReadAt = now;
        }

        if (unreadMessages.Length > 0)
        {
            thread.UpdatedAt = now;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return new MarkThreadReadResultDto(thread.Id, unreadMessages.Length);
    }

    private IQueryable<MessageThread> BuildScopedThreadQuery(Guid userId, string role)
    {
        var query = dbContext.MessageThreads
            .AsNoTracking()
            .AsQueryable();

        if (IsAdmin(role))
        {
            return query;
        }

        if (IsSeller(role))
        {
            return query.Where(thread => thread.SellerId == userId);
        }

        return query.Where(thread => thread.BuyerId == userId);
    }

    private IQueryable<MessageThread> GetThreadQuery(bool track = false)
    {
        var query = track
            ? dbContext.MessageThreads.AsQueryable()
            : dbContext.MessageThreads.AsNoTracking();

        return query
            .Include(thread => thread.CommercialRequest)
            .Include(thread => thread.Listing)
            .Include(thread => thread.Buyer)
                .ThenInclude(user => user.Company)
            .Include(thread => thread.Seller)
                .ThenInclude(user => user.Company)
            .Include(thread => thread.Messages.OrderBy(message => message.CreatedAt))
                .ThenInclude(message => message.Sender)
                    .ThenInclude(user => user.Company);
    }

    private static void EnsureCanAccessThread(MessageThread thread, Guid userId, string role)
    {
        if (IsAdmin(role))
        {
            return;
        }

        if (thread.BuyerId == userId || thread.SellerId == userId)
        {
            return;
        }

        throw new InvalidOperationException("You do not have access to this thread.");
    }

    private static void EnsureCanAccessRequest(CommercialRequest request, Guid userId, string role)
    {
        if (IsAdmin(role))
        {
            return;
        }

        if (request.BuyerId == userId || request.SellerId == userId)
        {
            return;
        }

        throw new InvalidOperationException("You do not have access to this commercial request.");
    }

    private static MessageThreadListItemDto ToListItemDto(MessageThread thread, Guid currentUserId)
    {
        var lastMessage = thread.Messages
            .OrderByDescending(message => message.CreatedAt)
            .FirstOrDefault();
        var unreadCount = thread.Messages.Count(message => message.SenderId != currentUserId && message.ReadAt is null);

        return new MessageThreadListItemDto(
            thread.Id,
            thread.CommercialRequestId,
            thread.ListingId,
            BuildListingTitle(thread.Listing),
            BuildDisplayName(thread.Buyer),
            BuildDisplayName(thread.Seller),
            lastMessage?.Body ?? thread.CommercialRequest?.Message ?? string.Empty,
            lastMessage?.CreatedAt ?? thread.LastMessageAt,
            unreadCount,
            ToStatusValue(thread.Status));
    }

    private static MessageThreadDetailDto ToDetailDto(MessageThread thread, Guid currentUserId)
    {
        return new MessageThreadDetailDto(
            thread.Id,
            thread.CommercialRequestId,
            new MessageThreadListingDto(
                thread.ListingId,
                BuildListingTitle(thread.Listing),
                thread.Listing.Quantity,
                thread.Listing.Unit),
            BuildDisplayName(thread.Buyer),
            BuildDisplayName(thread.Seller),
            ToStatusValue(thread.Status),
            thread.Messages
                .OrderBy(message => message.CreatedAt)
                .Select(message => ToMessageDto(message, currentUserId))
                .ToArray());
    }

    private static MessageItemDto ToMessageDto(Message message, Guid currentUserId)
    {
        return new MessageItemDto(
            message.Id,
            message.SenderId,
            BuildDisplayName(message.Sender),
            message.Body,
            message.CreatedAt,
            message.ReadAt,
            message.SenderId == currentUserId);
    }

    private static string BuildListingTitle(Listing listing)
    {
        if (!string.IsNullOrWhiteSpace(listing.SpecificResidue))
        {
            return listing.SpecificResidue;
        }

        if (!string.IsNullOrWhiteSpace(listing.ProductType))
        {
            return listing.ProductType;
        }

        return $"Listing {listing.ReferenceCode}";
    }

    private static string BuildDisplayName(User user)
    {
        return user.Company?.BusinessName ?? user.FullName;
    }

    private static string ToStatusValue(MessageThreadStatus status)
    {
        return status switch
        {
            MessageThreadStatus.Closed => "closed",
            MessageThreadStatus.Archived => "archived",
            _ => "active"
        };
    }

    private static bool IsAdmin(string role)
    {
        return string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsSeller(string role)
    {
        return string.Equals(role, "seller", StringComparison.OrdinalIgnoreCase);
    }
}
