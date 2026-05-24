namespace ReciclaYa.Application.Regulation.Options;

public sealed class RegulationReviewOptions
{
    public const string SectionName = "RegulationReview";

    public int PendingReviewDeadlineHours { get; set; } = 72;

    public int SweepIntervalMinutes { get; set; } = 15;
}
