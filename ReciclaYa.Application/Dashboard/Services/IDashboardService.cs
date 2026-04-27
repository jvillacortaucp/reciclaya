using ReciclaYa.Application.Dashboard.Dtos;

namespace ReciclaYa.Application.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(
        Guid userId,
        string role,
        CancellationToken cancellationToken = default);
}
