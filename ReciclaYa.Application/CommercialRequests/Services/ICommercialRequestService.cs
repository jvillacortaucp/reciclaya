using ReciclaYa.Application.CommercialRequests.Dtos;

namespace ReciclaYa.Application.CommercialRequests.Services;

public interface ICommercialRequestService
{
    Task<IReadOnlyCollection<CommercialRequestDto>> GetRequestsAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<CommercialRequestDto?> GetByIdAsync(
        Guid id,
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);

    Task<CommercialRequestDto> CreateAsync(
        Guid buyerId,
        CreateCommercialRequestDto request,
        CancellationToken cancellationToken = default);

    Task<CommercialRequestDto?> AcceptAsync(
        Guid id,
        Guid sellerId,
        CancellationToken cancellationToken = default);

    Task<CommercialRequestDto?> RejectAsync(
        Guid id,
        Guid sellerId,
        CancellationToken cancellationToken = default);

    Task<CommercialRequestDto?> CancelAsync(
        Guid id,
        Guid buyerId,
        CancellationToken cancellationToken = default);
}
