using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Checkout.Dtos;
using ReciclaYa.Application.Orders.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Orders.Services;

public sealed class OrderService(IAuthDbContext dbContext) : IOrderService
{
    public async Task<IReadOnlyCollection<OrderListItemDto>> GetOrdersAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var orders = await BuildScopedQuery(userId, role)
            .OrderByDescending(order => order.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(ToListItemDto).ToArray();
    }

    public async Task<OrderDetailDto?> GetByIdAsync(
        Guid orderId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default)
    {
        var order = await BuildScopedQuery(userId, role)
            .AsSplitQuery()
            .Include(item => item.PaymentTransactions)
            .FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);

        return order is null ? null : ToDetailDto(order);
    }

    private IQueryable<PurchaseOrder> BuildScopedQuery(Guid userId, string role)
    {
        var query = dbContext.PurchaseOrders
            .AsNoTracking()
            .Include(order => order.Listing)
            .Include(order => order.Buyer)
                .ThenInclude(user => user.Company)
            .Include(order => order.Seller)
                .ThenInclude(user => user.Company)
            .AsQueryable();

        if (IsAdmin(role))
        {
            return query;
        }

        if (IsSeller(role))
        {
            return query.Where(order => order.SellerId == userId);
        }

        return query.Where(order => order.BuyerId == userId);
    }

    private static OrderListItemDto ToListItemDto(PurchaseOrder order)
    {
        return new OrderListItemDto(
            order.Id,
            order.OrderNumber,
            order.ListingId,
            BuildListingTitle(order.Listing),
            BuildDisplayName(order.Buyer),
            BuildDisplayName(order.Seller),
            order.Quantity,
            order.Total,
            order.Currency,
            ToOrderStatusValue(order.Status),
            order.CreatedAt,
            order.PaidAt);
    }

    private static OrderDetailDto ToDetailDto(PurchaseOrder order)
    {
        return new OrderDetailDto(
            order.Id,
            order.OrderNumber,
            order.ListingId,
            BuildListingTitle(order.Listing),
            order.BuyerId,
            BuildDisplayName(order.Buyer),
            order.SellerId,
            BuildDisplayName(order.Seller),
            order.PreOrderId,
            order.PaymentTransactionId,
            order.Quantity,
            new CheckoutPricingDto(
                order.UnitPrice,
                order.Subtotal,
                order.LogisticsFee,
                order.AdminFee,
                order.Total,
                order.Currency),
            ToOrderStatusValue(order.Status),
            order.CreatedAt,
            order.UpdatedAt,
            order.PaidAt,
            order.PaymentTransactions
                .OrderByDescending(payment => payment.CreatedAt)
                .Select(payment => new OrderPaymentSummaryDto(
                    payment.Id,
                    payment.Provider,
                    payment.ProviderReference,
                    ToPaymentStatusValue(payment.Status),
                    payment.PaymentMethod,
                    payment.Amount,
                    payment.Currency,
                    payment.CardLast4,
                    payment.CardBrand,
                    payment.FailureReason,
                    payment.CreatedAt,
                    payment.PaidAt))
                .ToArray());
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

    private static string ToOrderStatusValue(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Paid => "paid",
            OrderStatus.Cancelled => "cancelled",
            OrderStatus.Completed => "completed",
            _ => "created"
        };
    }

    private static string ToPaymentStatusValue(PaymentStatus status)
    {
        return status switch
        {
            PaymentStatus.Approved => "approved",
            PaymentStatus.Rejected => "rejected",
            PaymentStatus.Failed => "failed",
            PaymentStatus.Cancelled => "cancelled",
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
}
