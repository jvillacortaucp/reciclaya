using ReciclaYa.Application.PreOrders.Dtos;

namespace ReciclaYa.Application.PreOrders.Services;

public interface IPreOrderService
{
    Task<IReadOnlyCollection<PreOrderDto>> GetPreOrdersAsync(
        Guid userId,
        bool isAdmin,
        CancellationToken cancellationToken = default);

    Task<PreOrderNewScreenDto?> GetNewScreenAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<PreOrderPricingDto> SimulateAsync(
        Guid userId,
        bool isAdmin,
        PreOrderRequestDto request,
        CancellationToken cancellationToken = default);

    Task<PreOrderDto> CreateAsync(
        Guid userId,
        bool isAdmin,
        PreOrderRequestDto request,
        CancellationToken cancellationToken = default);
}
