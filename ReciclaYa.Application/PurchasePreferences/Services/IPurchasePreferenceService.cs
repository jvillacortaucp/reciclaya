using ReciclaYa.Application.PurchasePreferences.Dtos;

namespace ReciclaYa.Application.PurchasePreferences.Services;

public interface IPurchasePreferenceService
{
    Task<bool> CanManagePreferencesAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<PurchasePreferenceResponseDto> GetCurrentAsync(
        Guid buyerId,
        CancellationToken cancellationToken = default);

    Task<PurchasePreferenceResponseDto> SaveCurrentAsync(
        Guid buyerId,
        PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken = default);

    Task<PurchasePreferenceResponseDto> ActivateAlertAsync(
        Guid buyerId,
        PurchasePreferenceRequestDto? request,
        CancellationToken cancellationToken = default);

    Task<PurchasePreferenceSummaryDto> BuildSummaryAsync(
        PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken = default);
}
