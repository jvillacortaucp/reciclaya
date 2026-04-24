namespace ReciclaYa.Application.Payments.Dtos;

public sealed record SimulatePaymentRequestDto(
    Guid OrderId,
    string PaymentMethod,
    string? CardNumber,
    string? CardHolder,
    string? ExpirationMonth,
    string? ExpirationYear,
    string? Cvv,
    string SimulateResult);

public sealed record PaymentTransactionDto(
    Guid PaymentId,
    Guid OrderId,
    string Status,
    string Provider,
    string? ProviderReference,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    string? CardLast4,
    string? CardBrand,
    DateTime? PaidAt);
