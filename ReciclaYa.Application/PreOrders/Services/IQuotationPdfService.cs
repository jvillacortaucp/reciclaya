namespace ReciclaYa.Application.PreOrders.Services;

public interface IQuotationPdfService
{
    Task<byte[]> GeneratePreOrderQuotationPdfAsync(
        Guid preOrderId,
        Guid currentUserId,
        bool isAdmin,
        CancellationToken cancellationToken = default);
}

