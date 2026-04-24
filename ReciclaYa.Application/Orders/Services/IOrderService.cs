using ReciclaYa.Application.Orders.Dtos;

namespace ReciclaYa.Application.Orders.Services;

public interface IOrderService
{
    Task<IReadOnlyCollection<OrderListItemDto>> GetOrdersAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<OrderDetailDto?> GetByIdAsync(
        Guid orderId,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);
}
