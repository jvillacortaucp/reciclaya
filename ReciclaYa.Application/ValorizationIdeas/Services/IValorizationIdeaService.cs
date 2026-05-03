using ReciclaYa.Application.Listings.Dtos;
using ReciclaYa.Application.ValorizationIdeas.Dtos;

namespace ReciclaYa.Application.ValorizationIdeas.Services;

public interface IValorizationIdeaService
{
    Task<IReadOnlyCollection<ValorizationIdeaDto>?> GetByListingAsync(
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ValorizationIdeaDto>?> GenerateAsync(
        Guid listingId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<ValorizationIdeaDto>> PreviewAsync(
        WasteSellRequestDto request,
        CancellationToken cancellationToken = default);
}
