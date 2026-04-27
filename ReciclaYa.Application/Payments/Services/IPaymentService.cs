using ReciclaYa.Application.Payments.Dtos;

namespace ReciclaYa.Application.Payments.Services;

public interface IPaymentService
{
    Task<PaymentTransactionDto> SimulateAsync(
        Guid userId,
        bool isAdmin,
        SimulatePaymentRequestDto request,
        CancellationToken cancellationToken = default);
}
