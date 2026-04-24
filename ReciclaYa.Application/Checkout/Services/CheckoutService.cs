using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Checkout.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Checkout.Services;

public sealed class CheckoutService(IAuthDbContext dbContext) : ICheckoutService
{
    public async Task<CheckoutOrderDto> CreateFromListingAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        CreateCheckoutFromListingRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var listing = await GetPublishedListingAsync(listingId, cancellationToken);
        if (listing is null)
        {
            throw new InvalidOperationException("Listing not found or not published.");
        }

        EnsureCanCheckout(userId, isAdmin, listing);
        ValidateQuantity(request.Quantity, listing.Quantity);

        var now = DateTime.UtcNow;
        var pricing = CalculatePricing(listing, request.Quantity, request.ReserveStock);
        var order = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            OrderNumber = await GenerateOrderNumberAsync(now, cancellationToken),
            BuyerId = userId,
            SellerId = listing.SellerId,
            ListingId = listing.Id,
            Quantity = request.Quantity,
            UnitPrice = pricing.UnitPrice,
            Subtotal = pricing.Subtotal,
            LogisticsFee = pricing.LogisticsFee,
            AdminFee = pricing.AdminFee,
            Total = pricing.Total,
            Currency = pricing.Currency,
            Status = OrderStatus.Created,
            CreatedAt = now,
            UpdatedAt = now,
            Seller = listing.Seller,
            Listing = listing
        };

        dbContext.PurchaseOrders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToCheckoutOrderDto(order, listing);
    }

    public async Task<CheckoutOrderDto> CreateFromPreOrderAsync(
        Guid userId,
        bool isAdmin,
        Guid preOrderId,
        CancellationToken cancellationToken = default)
    {
        var preOrder = await dbContext.PreOrders
            .Include(item => item.Listing)
                .ThenInclude(listing => listing.Seller)
                    .ThenInclude(seller => seller.Company)
            .FirstOrDefaultAsync(item => item.Id == preOrderId, cancellationToken);

        if (preOrder is null)
        {
            throw new InvalidOperationException("Pre-order not found.");
        }

        if (!isAdmin && preOrder.BuyerId != userId)
        {
            throw new InvalidOperationException("You can only checkout your own pre-order.");
        }

        if (preOrder.Listing.Status != ListingStatus.Published || preOrder.Listing.DeletedAt is not null)
        {
            throw new InvalidOperationException("Listing not found or not published.");
        }

        EnsureCanCheckout(preOrder.BuyerId, isAdmin, preOrder.Listing);
        ValidateQuantity(preOrder.Quantity, preOrder.Listing.Quantity);

        var now = DateTime.UtcNow;
        var order = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            OrderNumber = await GenerateOrderNumberAsync(now, cancellationToken),
            BuyerId = preOrder.BuyerId,
            SellerId = preOrder.Listing.SellerId,
            ListingId = preOrder.ListingId,
            PreOrderId = preOrder.Id,
            Quantity = preOrder.Quantity,
            UnitPrice = preOrder.UnitPrice,
            Subtotal = preOrder.Subtotal,
            LogisticsFee = preOrder.LogisticsFee,
            AdminFee = preOrder.AdminFee,
            Total = preOrder.Total,
            Currency = preOrder.Currency,
            Status = OrderStatus.Created,
            CreatedAt = now,
            UpdatedAt = now,
            PreOrder = preOrder,
            Listing = preOrder.Listing,
            Seller = preOrder.Listing.Seller
        };

        dbContext.PurchaseOrders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToCheckoutOrderDto(order, preOrder.Listing);
    }

    private async Task<Listing?> GetPublishedListingAsync(Guid listingId, CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .Include(listing => listing.Seller)
                .ThenInclude(seller => seller.Company)
            .FirstOrDefaultAsync(
                listing => listing.Id == listingId
                    && listing.Status == ListingStatus.Published
                    && listing.DeletedAt == null,
                cancellationToken);
    }

    private async Task<string> GenerateOrderNumberAsync(DateTime now, CancellationToken cancellationToken)
    {
        var year = now.Year;
        var count = await dbContext.PurchaseOrders.CountAsync(
            order => order.CreatedAt >= new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                && order.CreatedAt < new DateTime(year + 1, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            cancellationToken);

        return $"RY-{year}-{(count + 1):D6}";
    }

    private static CheckoutPricingDto CalculatePricing(Listing listing, decimal quantity, bool reserveStock)
    {
        var unitPrice = listing.PricePerUnitUsd ?? 0m;
        var subtotal = quantity * unitPrice;
        var logisticsFee = reserveStock ? 24m : 32m;
        var adminFee = 0m;
        var total = subtotal + logisticsFee + adminFee;

        return new CheckoutPricingDto(
            unitPrice,
            subtotal,
            logisticsFee,
            adminFee,
            total,
            string.IsNullOrWhiteSpace(listing.Currency) ? "USD" : listing.Currency);
    }

    private static void EnsureCanCheckout(Guid buyerId, bool isAdmin, Listing listing)
    {
        if (listing.SellerId == buyerId)
        {
            throw new InvalidOperationException("You cannot buy your own listing.");
        }

        if (!isAdmin)
        {
            return;
        }
    }

    private static void ValidateQuantity(decimal quantity, decimal availableQuantity)
    {
        if (quantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        if (quantity > availableQuantity)
        {
            throw new InvalidOperationException("Quantity cannot exceed available listing quantity.");
        }
    }

    private static CheckoutOrderDto ToCheckoutOrderDto(PurchaseOrder order, Listing listing)
    {
        return new CheckoutOrderDto(
            order.Id,
            order.OrderNumber,
            order.ListingId,
            BuildListingTitle(listing),
            listing.Seller.Company?.BusinessName ?? listing.Seller.FullName,
            order.Quantity,
            new CheckoutPricingDto(
                order.UnitPrice,
                order.Subtotal,
                order.LogisticsFee,
                order.AdminFee,
                order.Total,
                order.Currency),
            ToStatusValue(order.Status));
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

    private static string ToStatusValue(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Paid => "paid",
            OrderStatus.Cancelled => "cancelled",
            OrderStatus.Completed => "completed",
            _ => "created"
        };
    }
}
