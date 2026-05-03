using ReciclaYa.Application.Payments.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Payments.Services;

public interface IPaymentProvider
{
    Task<SimulatedPaymentResult> ProcessAsync(
        PurchaseOrder order,
        SimulatePaymentRequestDto request,
        CancellationToken cancellationToken = default);
}

public sealed record SimulatedPaymentResult(
    PaymentStatus Status,
    string Provider,
    string ProviderReference,
    string PaymentMethod,
    string? CardLast4,
    string? CardBrand,
    string? FailureReason,
    DateTime? PaidAt);
