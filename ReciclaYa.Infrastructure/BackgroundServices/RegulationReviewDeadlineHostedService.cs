using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Regulation.Options;
using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Infrastructure.BackgroundServices;

public sealed class RegulationReviewDeadlineHostedService(
    IServiceScopeFactory scopeFactory,
    IOptionsMonitor<RegulationReviewOptions> optionsMonitor,
    ILogger<RegulationReviewDeadlineHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RejectExpiredReviewsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while sweeping expired regulation reviews.");
            }

            var intervalMinutes = Math.Clamp(optionsMonitor.CurrentValue.SweepIntervalMinutes, 1, 1440);
            await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
        }
    }

    private async Task RejectExpiredReviewsAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IAuthDbContext>();
        var deadlineHours = Math.Clamp(optionsMonitor.CurrentValue.PendingReviewDeadlineHours, 1, 24 * 30);
        var now = DateTime.UtcNow;
        var threshold = now.AddHours(-deadlineHours);

        var expiredPendingRequirements = await dbContext.UserRegulationRequirements
            .Where(item =>
                (item.Status == "uploaded" || item.Status == "in_review")
                && item.UpdatedAt <= threshold)
            .ToListAsync(cancellationToken);

        if (expiredPendingRequirements.Count == 0)
        {
            return;
        }

        foreach (var requirement in expiredPendingRequirements)
        {
            requirement.Status = "rejected";
            requirement.Notes = $"Rechazo automático por vencimiento del plazo de revisión ({deadlineHours} horas).";
            requirement.UpdatedAt = now;

            dbContext.RegulationOperationAudits.Add(new RegulationOperationAudit
            {
                Id = Guid.NewGuid(),
                UserId = requirement.UserId,
                Actor = "system:review-timeout",
                Action = "review_requirement_timeout",
                Allowed = false,
                RequiredMinLevel = requirement.Level,
                ActorCurrentLevel = requirement.Level,
                BlockingReasonCode = "REVIEW_TIMEOUT_AUTO_REJECTED",
                ContextResidueType = requirement.RequirementCode,
                ContextSector = "regulation",
                ContextProductType = null,
                ContextSpecificResidue = null,
                ContextQuantity = null,
                ContextUnit = null,
                ManualReviewRequired = false,
                CreatedAt = now
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Auto-rejected {Count} expired regulation reviews using a {DeadlineHours}-hour deadline.",
            expiredPendingRequirements.Count,
            deadlineHours);
    }
}
