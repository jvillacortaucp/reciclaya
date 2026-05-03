namespace ReciclaYa.Application.Listings.Dtos;

public sealed record ListingPreviewDto(
    string Title,
    string ResidueTypeLabel,
    string SectorLabel,
    string VolumeLabel,
    string EstimatedValueLabel,
    string LocationLabel,
    string AvailabilityLabel,
    string StatusLabel,
    int CompletionPercentage);
