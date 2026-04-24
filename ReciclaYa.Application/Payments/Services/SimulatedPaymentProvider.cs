using ReciclaYa.Application.Payments.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Payments.Services;

public sealed class SimulatedPaymentProvider : IPaymentProvider
{
    public Task<SimulatedPaymentResult> ProcessAsync(
        PurchaseOrder order,
        SimulatePaymentRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var status = ParseStatus(request.SimulateResult);
        DateTime? paidAt = status == PaymentStatus.Approved ? DateTime.UtcNow : null;

        return Task.FromResult(new SimulatedPaymentResult(
            status,
            "simulated",
            $"SIM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}",
            NormalizePaymentMethod(request.PaymentMethod),
            ExtractLast4(request.CardNumber),
            ResolveCardBrand(request.CardNumber),
            status == PaymentStatus.Approved ? null : $"Simulated payment {request.SimulateResult}.",
            paidAt));
    }

    private static PaymentStatus ParseStatus(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "approved" => PaymentStatus.Approved,
            "rejected" => PaymentStatus.Rejected,
            "failed" => PaymentStatus.Failed,
            "cancelled" => PaymentStatus.Cancelled,
            _ => PaymentStatus.Pending
        };
    }

    private static string NormalizePaymentMethod(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? "unknown" : value.Trim().ToLowerInvariant();
    }

    private static string? ExtractLast4(string? cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
        {
            return null;
        }

        var digits = new string(cardNumber.Where(char.IsDigit).ToArray());
        return digits.Length >= 4 ? digits[^4..] : null;
    }

    private static string? ResolveCardBrand(string? cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
        {
            return null;
        }

        var digits = new string(cardNumber.Where(char.IsDigit).ToArray());
        if (digits.StartsWith('4'))
        {
            return "Visa";
        }

        if (digits.StartsWith("34") || digits.StartsWith("37"))
        {
            return "Amex";
        }

        if (digits.Length >= 2
            && int.TryParse(digits[..2], out var prefix)
            && prefix is >= 51 and <= 55)
        {
            return "Mastercard";
        }

        return "Card";
    }
}
