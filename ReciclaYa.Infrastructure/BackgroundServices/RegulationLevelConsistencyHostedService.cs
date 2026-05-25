using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Regulation.Services;

namespace ReciclaYa.Infrastructure.BackgroundServices;

public sealed class RegulationLevelConsistencyHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<RegulationLevelConsistencyHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan SweepInterval = TimeSpan.FromHours(24);
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(InitialDelay, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RecalculateAllUserLevelsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while running regulation level consistency sweep.");
            }

            await Task.Delay(SweepInterval, stoppingToken);
        }
    }

    private async Task RecalculateAllUserLevelsAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAuthDbContext>();
        var regulationService = scope.ServiceProvider.GetRequiredService<IRegulationService>();

        var userIds = await dbContext.Users
            .AsNoTracking()
            .Select(item => item.Id)
            .ToListAsync(cancellationToken);

        var changed = 0;
        foreach (var userId in userIds)
        {
            var result = await regulationService.RecalculateUserLevelAsync(userId, "system:consistency-sweep", cancellationToken);
            if (result.Changed)
            {
                changed++;
            }
        }

        logger.LogInformation(
            "Regulation consistency sweep completed. UsersChecked={UsersChecked}, LevelsChanged={LevelsChanged}",
            userIds.Count,
            changed);
    }
}
