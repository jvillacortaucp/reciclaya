using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.PreOrders.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.PreOrders.Services;

public sealed class PreOrderService(IAuthDbContext dbContext) : IPreOrderService
{
    public async Task<IReadOnlyCollection<PreOrderDto>> GetPreOrdersAsync(
        Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default)
    {
        IQueryable<PreOrder> query = dbContext.PreOrders
            .AsNoTracking()
            .Include(preOrder => preOrder.Listing)
            .OrderByDescending(preOrder => preOrder.CreatedAt);

        if (!isAdmin)
        {
            query = query.Where(preOrder => preOrder.BuyerId == userId);
        }

        var preOrders = await query.ToListAsync(cancellationToken);
        return preOrders.Select(ToDto).ToArray();
    }

    public async Task<PreOrderNewScreenDto?> GetNewScreenAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        CancellationToken cancellationToken = default)
    {
        var listing = await GetPublishedListingAsync(listingId, cancellationToken);
        if (listing is null)
        {
            return null;
        }

        EnsureCanUseListing(userId, isAdmin, listing);

        return BuildScreenDto(listing);
    }

    public async Task<PreOrderPricingDto> SimulateAsync(
        Guid userId,
        bool isAdmin,
        PreOrderRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var listing = await GetPublishedListingAsync(request.ListingId, cancellationToken);
        if (listing is null)
        {
            throw new InvalidOperationException("Listing not found or not published.");
        }

        EnsureCanUseListing(userId, isAdmin, listing);
        ValidateQuantity(request.Quantity, listing.Quantity);

        return CalculatePricing(listing, request.Quantity, request.ReserveStock);
    }

    public async Task<PreOrderDto> CreateAsync(
        Guid userId,
        bool isAdmin,
        PreOrderRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var listing = await GetPublishedListingAsync(request.ListingId, cancellationToken);
        if (listing is null)
        {
            throw new InvalidOperationException("Listing not found or not published.");
        }

        EnsureCanUseListing(userId, isAdmin, listing);
        ValidateQuantity(request.Quantity, listing.Quantity);

        var now = DateTime.UtcNow;
        var pricing = CalculatePricing(listing, request.Quantity, request.ReserveStock);
        var status = ParseStatus(request.Status);

        var preOrder = new PreOrder
        {
            Id = Guid.NewGuid(),
            ListingId = listing.Id,
            BuyerId = userId,
            Quantity = request.Quantity,
            DesiredDate = EnsureUtc(request.DesiredDate),
            ReserveStock = request.ReserveStock,
            Notes = EmptyToNull(request.Notes),
            PaymentMethod = request.PaymentMethod.Type,
            Status = status,
            UnitPrice = pricing.UnitPrice,
            Subtotal = pricing.Subtotal,
            LogisticsFee = pricing.LogisticsFee,
            AdminFee = pricing.AdminFee,
            Total = pricing.Total,
            Currency = pricing.Currency,
            CreatedAt = now,
            UpdatedAt = now,
            SubmittedAt = status == PreOrderStatus.Submitted ? now : null
        };

        dbContext.PreOrders.Add(preOrder);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(preOrder);
    }

    private async Task<Listing?> GetPublishedListingAsync(Guid listingId, CancellationToken cancellationToken)
    {
        return await dbContext.Listings
            .AsNoTracking()
            .Include(listing => listing.Seller)
                .ThenInclude(seller => seller.Company)
            .Include(listing => listing.Media)
            .FirstOrDefaultAsync(
                listing => listing.Id == listingId
                    && listing.Status == ListingStatus.Published
                    && listing.DeletedAt == null,
                cancellationToken);
    }

    private static void EnsureCanUseListing(Guid userId, bool isAdmin, Listing listing)
    {
        if (listing.SellerId == userId)
        {
            throw new InvalidOperationException("You cannot create a pre-order on your own listing.");
        }

        if (!isAdmin)
        {
            return;
        }
    }

    private static void ValidateQuantity(decimal requestedQuantity, decimal availableQuantity)
    {
        if (requestedQuantity <= 0)
        {
            throw new InvalidOperationException("Quantity must be greater than zero.");
        }

        if (requestedQuantity > availableQuantity)
        {
            throw new InvalidOperationException("Quantity cannot exceed available listing quantity.");
        }
    }

    private static PreOrderPricingDto CalculatePricing(Listing listing, decimal quantity, bool reserveStock)
    {
        var unitPrice = listing.PricePerUnitUsd ?? 0m;
        var subtotal = quantity * unitPrice;
        var logisticsFee = reserveStock ? 24m : 32m;
        var adminFee = 0m;
        var total = subtotal + logisticsFee + adminFee;

        return new PreOrderPricingDto(
            unitPrice,
            quantity,
            subtotal,
            logisticsFee,
            adminFee,
            total,
            string.IsNullOrWhiteSpace(listing.Currency) ? "USD" : listing.Currency,
            0);
    }

    private static PreOrderDto ToDto(PreOrder preOrder)
    {
        return new PreOrderDto(
            preOrder.Id,
            preOrder.ListingId,
            preOrder.BuyerId,
            preOrder.Quantity,
            preOrder.DesiredDate,
            preOrder.ReserveStock,
            preOrder.Notes,
            new PreOrderPaymentMethodDto(preOrder.PaymentMethod, ToPaymentMethodLabel(preOrder.PaymentMethod)),
            ToStatusValue(preOrder.Status),
            new PreOrderPricingDto(
                preOrder.UnitPrice,
                preOrder.Quantity,
                preOrder.Subtotal,
                preOrder.LogisticsFee,
                preOrder.AdminFee,
                preOrder.Total,
                preOrder.Currency,
                0),
            preOrder.CreatedAt,
            preOrder.UpdatedAt,
            preOrder.SubmittedAt);
    }

    private static PreOrderNewScreenDto BuildScreenDto(Listing listing)
    {
        var availableQuantity = listing.Quantity;
        var defaultQuantity = Math.Min(10m, Math.Max(1m, availableQuantity));
        var paymentMethods = GetPaymentMethods();
        var pricing = CalculatePricing(listing, defaultQuantity, reserveStock: true);
        var snapshot = ToSnapshot(listing);

        return new PreOrderNewScreenDto(
            snapshot,
            snapshot,
            defaultQuantity,
            availableQuantity,
            paymentMethods,
            pricing,
            48,
            BuildDefaultDate(listing),
            string.Empty,
            "transfer",
            new PreOrderDraftInfoDto(
                $"PO-{listing.ReferenceCode}",
                "Sincronizado hace unos segundos"),
            new PreOrderSupportInfoDto(
                "Necesitas ayuda?",
                "Contacta a tu asesor de cuenta para asistencia en la orden."));
    }

    private static PreOrderScreenListingDto ToSnapshot(Listing listing)
    {
        return new PreOrderScreenListingDto(
            listing.Id,
            listing.SpecificResidue,
            ToResidueTypeLabel(listing.WasteType),
            ToSectorLabel(listing.Sector),
            $"{listing.Quantity:0.###} {ToUnitLabel(listing.Unit)}",
            listing.Location,
            listing.Seller.Company?.BusinessName ?? listing.Seller.FullName,
            listing.PricePerUnitUsd ?? 0m,
            ToUnitLabel(listing.Unit),
            listing.Quantity,
            listing.Media.OrderBy(media => media.SortOrder).FirstOrDefault()?.Url ?? string.Empty);
    }

    private static IReadOnlyCollection<PreOrderPaymentMethodDto> GetPaymentMethods()
    {
        return
        [
            new PreOrderPaymentMethodDto("transfer", "Transferencia"),
            new PreOrderPaymentMethodDto("cash", "Contraentrega"),
            new PreOrderPaymentMethodDto("credit", "Tarjeta")
        ];
    }

    private static string BuildDefaultDate(Listing listing)
    {
        var date = listing.NextAvailabilityDate ?? DateTime.UtcNow.Date.AddDays(7);
        return EnsureUtc(date).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static PreOrderStatus ParseStatus(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "submitted" => PreOrderStatus.Submitted,
            "accepted" => PreOrderStatus.Accepted,
            "rejected" => PreOrderStatus.Rejected,
            "cancelled" => PreOrderStatus.Cancelled,
            _ => PreOrderStatus.Draft
        };
    }

    private static string ToStatusValue(PreOrderStatus status)
    {
        return status switch
        {
            PreOrderStatus.Submitted => "submitted",
            PreOrderStatus.Accepted => "accepted",
            PreOrderStatus.Rejected => "rejected",
            PreOrderStatus.Cancelled => "cancelled",
            _ => "draft"
        };
    }

    private static string ToPaymentMethodLabel(string value)
    {
        return value switch
        {
            "transfer" => "Transferencia",
            "cash" => "Contraentrega",
            "credit" => "Tarjeta",
            _ => value
        };
    }

    private static string ToResidueTypeLabel(string value)
    {
        return value switch
        {
            "organic" => "Organico",
            "inorganic" => "Inorganico",
            _ => value
        };
    }

    private static string ToSectorLabel(string value)
    {
        return value switch
        {
            "agriculture" => "Agricola",
            "agroindustry" => "Agroindustrial",
            "metallurgical" => "Metalurgico",
            "food" => "Alimenticio",
            "industrial" => "Industrial",
            _ => value
        };
    }

    private static string ToUnitLabel(string value)
    {
        return value switch
        {
            "tons" => "Ton",
            "kg" => "Kg",
            "m3" => "m3",
            _ => value
        };
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    private static DateTime? EnsureUtc(DateTime? value)
    {
        return value is null ? null : EnsureUtc(value.Value);
    }

    private static string? EmptyToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
