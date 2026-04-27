using ReciclaYa.Application.Checkout.Dtos;

namespace ReciclaYa.Application.Orders.Dtos;

public sealed record OrderListItemDto(
    Guid Id,
    string OrderNumber,
    Guid ListingId,
    string ListingTitle,
    string BuyerName,
    string SellerName,
    decimal Quantity,
    decimal Total,
    string Currency,
    string Status,
    DateTime CreatedAt,
    DateTime? PaidAt);

public sealed record OrderPaymentSummaryDto(
    Guid Id,
    string Provider,
    string? ProviderReference,
    string Status,
    string PaymentMethod,
    decimal Amount,
    string Currency,
    string? CardLast4,
    string? CardBrand,
    string? FailureReason,
    DateTime CreatedAt,
    DateTime? PaidAt);

public sealed record OrderDetailDto(
    Guid Id,
    string OrderNumber,
    Guid ListingId,
    string ListingTitle,
    Guid BuyerId,
    string BuyerName,
    Guid SellerId,
    string SellerName,
    Guid? PreOrderId,
    Guid? PaymentTransactionId,
    decimal Quantity,
    CheckoutPricingDto Pricing,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? PaidAt,
    IReadOnlyCollection<OrderPaymentSummaryDto> Payments);
