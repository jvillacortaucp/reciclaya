using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.CommercialRequests.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.CommercialRequests.Services;

public sealed class CommercialRequestService(IAuthDbContext dbContext) : ICommercialRequestService
{
    public async Task<IReadOnlyCollection<CommercialRequestDto>> GetRequestsAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var query = BuildScopedQuery(userId, role)
            .OrderByDescending(request => request.CreatedAt);

        var requests = await query.ToListAsync(cancellationToken);
        return requests.Select(ToDto).ToArray();
    }

    public async Task<CommercialRequestDto?> GetByIdAsync(
        Guid id,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var request = await BuildScopedQuery(userId, role)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        return request is null ? null : ToDto(request);
    }

    public async Task<CommercialRequestDto> CreateAsync(
        Guid buyerId,
        CreateCommercialRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var listing = await dbContext.Listings
            .Include(item => item.Seller)
                .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(
                item => item.Id == request.ListingId
                    && item.Status == ListingStatus.Published
                    && item.DeletedAt == null,
                cancellationToken);

        if (listing is null)
        {
            throw new InvalidOperationException("Listing not found or not published.");
        }

        if (listing.SellerId == buyerId)
        {
            throw new InvalidOperationException("You cannot create a request on your own listing.");
        }

        var buyer = await dbContext.Users
            .Include(user => user.Company)
            .FirstOrDefaultAsync(user => user.Id == buyerId, cancellationToken);

        if (buyer is null)
        {
            throw new InvalidOperationException("Buyer not found.");
        }

        var now = DateTime.UtcNow;
        var commercialRequest = new CommercialRequest
        {
            Id = Guid.NewGuid(),
            ListingId = listing.Id,
            BuyerId = buyerId,
            SellerId = listing.SellerId,
            Message = EmptyToNull(request.Message),
            Status = CommercialRequestStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now,
            Buyer = buyer,
            Seller = listing.Seller,
            Listing = listing
        };

        dbContext.CommercialRequests.Add(commercialRequest);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(commercialRequest);
    }

    public Task<CommercialRequestDto?> AcceptAsync(
        Guid id,
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        return UpdateSellerDecisionAsync(id, sellerId, CommercialRequestStatus.Accepted, cancellationToken);
    }

    public Task<CommercialRequestDto?> RejectAsync(
        Guid id,
        Guid sellerId,
        CancellationToken cancellationToken = default)
    {
        return UpdateSellerDecisionAsync(id, sellerId, CommercialRequestStatus.Rejected, cancellationToken);
    }

    public async Task<CommercialRequestDto?> CancelAsync(
        Guid id,
        Guid buyerId,
        CancellationToken cancellationToken = default)
    {
        var request = await dbContext.CommercialRequests
            .Include(item => item.Listing)
            .Include(item => item.Buyer)
                .ThenInclude(user => user.Company)
            .Include(item => item.Seller)
                .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (request is null)
        {
            return null;
        }

        if (request.BuyerId != buyerId)
        {
            throw new InvalidOperationException("You can only cancel your own requests.");
        }

        EnsurePending(request);

        var now = DateTime.UtcNow;
        request.Status = CommercialRequestStatus.Cancelled;
        request.UpdatedAt = now;
        request.CancelledAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(request);
    }

    private IQueryable<CommercialRequest> BuildScopedQuery(Guid userId, string role)
    {
        var query = dbContext.CommercialRequests
            .AsNoTracking()
            .Include(request => request.Listing)
            .Include(request => request.Buyer)
                .ThenInclude(user => user.Company)
            .Include(request => request.Seller)
                .ThenInclude(user => user.Company)
            .AsQueryable();

        if (IsAdmin(role))
        {
            return query;
        }

        if (IsSeller(role))
        {
            return query.Where(request => request.SellerId == userId);
        }

        return query.Where(request => request.BuyerId == userId);
    }

    private async Task<CommercialRequestDto?> UpdateSellerDecisionAsync(
        Guid id,
        Guid sellerId,
        CommercialRequestStatus status,
        CancellationToken cancellationToken)
    {
        var request = await dbContext.CommercialRequests
            .Include(item => item.Listing)
            .Include(item => item.Buyer)
                .ThenInclude(user => user.Company)
            .Include(item => item.Seller)
                .ThenInclude(user => user.Company)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (request is null)
        {
            return null;
        }

        if (request.SellerId != sellerId)
        {
            throw new InvalidOperationException("You can only respond to requests received on your listings.");
        }

        EnsurePending(request);

        var now = DateTime.UtcNow;
        request.Status = status;
        request.UpdatedAt = now;
        request.RespondedAt = now;
        request.CancelledAt = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(request);
    }

    private static void EnsurePending(CommercialRequest request)
    {
        if (request.Status != CommercialRequestStatus.Pending)
        {
            throw new InvalidOperationException("Only pending requests can be updated.");
        }
    }

    private static CommercialRequestDto ToDto(CommercialRequest request)
    {
        return new CommercialRequestDto(
            request.Id,
            request.ListingId,
            BuildListingTitle(request.Listing),
            request.BuyerId,
            BuildDisplayName(request.Buyer),
            request.SellerId,
            BuildDisplayName(request.Seller),
            request.Message,
            ToStatusValue(request.Status),
            request.CreatedAt);
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

    private static string ToStatusValue(CommercialRequestStatus status)
    {
        return status switch
        {
            CommercialRequestStatus.Accepted => "accepted",
            CommercialRequestStatus.Rejected => "rejected",
            CommercialRequestStatus.Cancelled => "cancelled",
            _ => "pending"
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

    private static string? EmptyToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
