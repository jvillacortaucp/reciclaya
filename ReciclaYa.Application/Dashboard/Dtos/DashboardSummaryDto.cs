namespace ReciclaYa.Application.Dashboard.Dtos;

public sealed record DashboardSummaryDto(
    IReadOnlyCollection<DashboardMetricDto> Metrics,
    IReadOnlyCollection<DashboardSeriesPointDto> VolumeSeries,
    IReadOnlyCollection<DashboardActivityDto> RecentActivity);

public sealed record DashboardMetricDto(
    string Key,
    string Label,
    string Value,
    string? DeltaText = null);

public sealed record DashboardSeriesPointDto(
    string Label,
    DateTime Date,
    decimal Value);

public sealed record DashboardActivityDto(
    string Id,
    string Type,
    string Title,
    string Description,
    DateTimeOffset OccurredAt);
