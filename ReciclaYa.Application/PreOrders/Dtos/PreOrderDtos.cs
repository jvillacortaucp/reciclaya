namespace ReciclaYa.Application.PreOrders.Dtos;

public sealed record PreOrderRequestDto(
    Guid ListingId,
    decimal Quantity,
    DateTime? DesiredDate,
    bool ReserveStock,
    string? Notes,
    PreOrderPaymentMethodDto PaymentMethod,
    string? Status = null);

public sealed record PreOrderPaymentMethodDto(
    string Type,
    string Label);

public sealed record PreOrderPricingDto(
    decimal UnitPrice,
    decimal Quantity,
    decimal Subtotal,
    decimal LogisticsFee,
    decimal AdminFee,
    decimal Total,
    string Currency,
    decimal Taxes = 0);

public sealed record PreOrderDto(
    Guid Id,
    Guid ListingId,
    Guid BuyerId,
    decimal Quantity,
    DateTime? DesiredDate,
    bool ReserveStock,
    string? Notes,
    PreOrderPaymentMethodDto PaymentMethod,
    string Status,
    PreOrderPricingDto Pricing,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? SubmittedAt);

public sealed record PreOrderScreenListingDto(
    Guid ListingId,
    string Title,
    string ResidueTypeLabel,
    string SectorLabel,
    string AvailabilityLabel,
    string LocationLabel,
    string ProviderLabel,
    decimal UnitPrice,
    string UnitLabel,
    decimal TotalAvailable,
    string ImageUrl);

public sealed record PreOrderDraftInfoDto(
    string DraftCode,
    string SyncedAtLabel);

public sealed record PreOrderSupportInfoDto(
    string Title,
    string Subtitle);

public sealed record PreOrderNewScreenDto(
    PreOrderScreenListingDto Listing,
    PreOrderScreenListingDto Product,
    decimal DefaultQuantity,
    decimal AvailableQuantity,
    IReadOnlyCollection<PreOrderPaymentMethodDto> PaymentMethods,
    PreOrderPricingDto EconomicSummary,
    int ReserveHours,
    string DefaultDate,
    string DefaultNotes,
    string SelectedPaymentType,
    PreOrderDraftInfoDto Draft,
    PreOrderSupportInfoDto Support);
