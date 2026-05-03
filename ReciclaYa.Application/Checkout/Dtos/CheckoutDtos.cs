namespace ReciclaYa.Application.Checkout.Dtos;

public sealed record CreateCheckoutFromListingRequestDto(
    decimal Quantity,
    bool ReserveStock,
    string? Notes);

public sealed record CheckoutPricingDto(
    decimal UnitPrice,
    decimal Subtotal,
    decimal LogisticsFee,
    decimal AdminFee,
    decimal Total,
    string Currency);

public sealed record CheckoutOrderDto(
    Guid OrderId,
    string OrderNumber,
    Guid ListingId,
    string ListingTitle,
    string SellerName,
    decimal Quantity,
    CheckoutPricingDto Pricing,
    string Status);
