using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Payments.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Payments.Services;

public sealed class PaymentService(
    IAuthDbContext dbContext,
    IPaymentProvider paymentProvider) : IPaymentService
{
    public async Task<PaymentTransactionDto> SimulateAsync(
        Guid userId,
        bool isAdmin,
        SimulatePaymentRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var order = await dbContext.PurchaseOrders
            .Include(item => item.Listing)
            .FirstOrDefaultAsync(item => item.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            throw new InvalidOperationException("Order not found.");
        }

        if (!isAdmin && order.BuyerId != userId)
        {
            throw new InvalidOperationException("You can only pay your own order.");
        }

        if (order.Status == OrderStatus.Paid)
        {
            throw new InvalidOperationException("Order is already paid.");
        }

        var result = await paymentProvider.ProcessAsync(order, request, cancellationToken);
        var now = DateTime.UtcNow;

        var transaction = new PaymentTransaction
        {
            Id = Guid.NewGuid(),
            BuyerId = order.BuyerId,
            OrderId = order.Id,
            ListingId = order.ListingId,
            Provider = result.Provider,
            ProviderReference = result.ProviderReference,
            Amount = order.Total,
            Currency = order.Currency,
            Status = result.Status,
            PaymentMethod = result.PaymentMethod,
            CardLast4 = result.CardLast4,
            CardBrand = result.CardBrand,
            FailureReason = result.FailureReason,
            CreatedAt = now,
            UpdatedAt = now,
            PaidAt = result.PaidAt
        };

        dbContext.PaymentTransactions.Add(transaction);
        order.PaymentTransactionId = transaction.Id;
        order.UpdatedAt = now;

        if (result.Status == PaymentStatus.Approved)
        {
            order.Status = OrderStatus.Paid;
            order.PaidAt = result.PaidAt ?? now;

            order.Listing.Quantity = Math.Max(0m, order.Listing.Quantity - order.Quantity);
            order.Listing.UpdatedAt = now;

            if (order.Listing.Quantity == 0)
            {
                order.Listing.Status = ListingStatus.Sold;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new PaymentTransactionDto(
            transaction.Id,
            order.Id,
            ToStatusValue(transaction.Status),
            transaction.Provider,
            transaction.ProviderReference,
            transaction.Amount,
            transaction.Currency,
            transaction.PaymentMethod,
            transaction.CardLast4,
            transaction.CardBrand,
            transaction.PaidAt);
    }

    private static string ToStatusValue(PaymentStatus status)
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
}
