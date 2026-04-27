using ReciclaYa.Application.Checkout.Dtos;

namespace ReciclaYa.Application.Checkout.Services;

public interface ICheckoutService
{
    Task<CheckoutOrderDto> CreateFromListingAsync(
        Guid userId,
        bool isAdmin,
        Guid listingId,
        CreateCheckoutFromListingRequestDto request,
        CancellationToken cancellationToken = default);

    Task<CheckoutOrderDto> CreateFromPreOrderAsync(
        Guid userId,
        bool isAdmin,
        Guid preOrderId,
        CancellationToken cancellationToken = default);
}
