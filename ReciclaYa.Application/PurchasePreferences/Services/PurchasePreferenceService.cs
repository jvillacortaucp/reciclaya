using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Auth.Services;
using ReciclaYa.Application.PurchasePreferences.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.PurchasePreferences.Services;

public sealed class PurchasePreferenceService(
    IAuthDbContext dbContext,
    IPermissionService permissionService) : IPurchasePreferenceService
{
    private const string EmptyStatus = "empty";
    private const string DraftStatus = "draft";
    private const string ActiveStatus = "active";

    public async Task<bool> CanManagePreferencesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            return false;
        }

        return user.Role is UserRole.Buyer or UserRole.Admin
            || permissionService.GetPermissions(user).Contains("manage:preferences");
    }

    public async Task<PurchasePreferenceResponseDto> GetCurrentAsync(
        Guid buyerId,
        CancellationToken cancellationToken = default)
    {
        var preference = await GetCurrentPreferenceQuery(buyerId)
            .FirstOrDefaultAsync(cancellationToken);

        return preference is null
            ? BuildEmptyState()
            : await ToResponseAsync(preference, cancellationToken);
    }

    public async Task<PurchasePreferenceResponseDto> SaveCurrentAsync(
        Guid buyerId,
        PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var preference = await GetCurrentPreferenceQuery(buyerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (preference is null)
        {
            preference = new PurchasePreference
            {
                Id = Guid.NewGuid(),
                BuyerId = buyerId,
                CreatedAt = now
            };

            dbContext.PurchasePreferences.Add(preference);
        }

        ApplyRequest(preference, request, now);
        preference.ProfileStatus = DraftStatus;
        preference.DraftSavedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ToResponseAsync(preference, cancellationToken);
    }

    public async Task<PurchasePreferenceResponseDto> ActivateAlertAsync(
        Guid buyerId,
        PurchasePreferenceRequestDto? request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var preference = await GetCurrentPreferenceQuery(buyerId)
            .FirstOrDefaultAsync(cancellationToken);

        if (preference is null)
        {
            preference = new PurchasePreference
            {
                Id = Guid.NewGuid(),
                BuyerId = buyerId,
                CreatedAt = now
            };

            dbContext.PurchasePreferences.Add(preference);
        }

        if (request is not null)
        {
            ApplyRequest(preference, request, now);
        }

        preference.AlertOnMatch = true;
        preference.ProfileStatus = ActiveStatus;
        preference.DraftSavedAt ??= now;
        preference.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ToResponseAsync(preference, cancellationToken);
    }

    public Task<PurchasePreferenceSummaryDto> BuildSummaryAsync(
        PurchasePreferenceRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var materialLabel = string.IsNullOrWhiteSpace(request.DesiredResidue.SpecificResidue)
            ? "No definido"
            : request.DesiredResidue.SpecificResidue;
        var volumeLabel = $"{request.Sourcing.RequiredVolume} {ToUnitLabel(request.Sourcing.Unit)} / {ToFrequencyLabel(request.Sourcing.PurchaseFrequency)}";
        var logisticsLabel = $"Radio {request.Logistics.RadiusKm}km - {request.Logistics.ReceivingLocation}";
        var urgencyLabel = ToPriorityLabel(request.Alerts.Priority);

        return Task.FromResult(new PurchasePreferenceSummaryDto(
            materialLabel,
            volumeLabel,
            logisticsLabel,
            urgencyLabel));
    }

    private IQueryable<PurchasePreference> GetCurrentPreferenceQuery(Guid buyerId)
    {
        return dbContext.PurchasePreferences
            .Where(preference => preference.BuyerId == buyerId)
            .OrderByDescending(preference => preference.ProfileStatus == ActiveStatus)
            .ThenByDescending(preference => preference.UpdatedAt);
    }

    private static void ApplyRequest(
        PurchasePreference preference,
        PurchasePreferenceRequestDto request,
        DateTime now)
    {
        preference.ResidueType = request.DesiredResidue.ResidueType;
        preference.Sector = request.DesiredResidue.Sector;
        preference.ProductType = request.DesiredResidue.ProductType;
        preference.SpecificResidue = EmptyToNull(request.DesiredResidue.SpecificResidue);
        preference.RequiredVolume = request.Sourcing.RequiredVolume;
        preference.Unit = request.Sourcing.Unit;
        preference.PurchaseFrequency = request.Sourcing.PurchaseFrequency;
        preference.MinPriceUsd = request.Sourcing.MinPriceUsd;
        preference.MaxPriceUsd = request.Sourcing.MaxPriceUsd;
        preference.DesiredCondition = request.Sourcing.DesiredCondition;
        preference.ReceivingLocation = request.Logistics.ReceivingLocation;
        preference.RadiusKm = request.Logistics.RadiusKm;
        preference.PreferredMode = request.Logistics.PreferredMode;
        preference.AcceptedExchangeType = request.Logistics.AcceptedExchangeType;
        preference.Notes = EmptyToNull(request.Alerts.Notes);
        preference.AlertOnMatch = request.Alerts.AlertOnMatch;
        preference.Priority = request.Alerts.Priority;
        preference.UpdatedAt = now;
    }

    private async Task<PurchasePreferenceResponseDto> ToResponseAsync(
        PurchasePreference preference,
        CancellationToken cancellationToken)
    {
        var projection = await BuildProjectionAsync(preference, cancellationToken);
        var completion = CalculateCompletionPercentage(preference);

        return new PurchasePreferenceResponseDto(
            new PurchasePreferenceFormValueDto(
                new DesiredResidueDto(
                    preference.ResidueType,
                    preference.Sector,
                    preference.ProductType,
                    preference.SpecificResidue ?? string.Empty),
                new SourcingPreferencesDto(
                    preference.RequiredVolume,
                    preference.Unit,
                    preference.PurchaseFrequency,
                    preference.MinPriceUsd,
                    preference.MaxPriceUsd,
                    preference.DesiredCondition),
                new LogisticsPreferencesDto(
                    preference.ReceivingLocation,
                    preference.RadiusKm,
                    preference.PreferredMode,
                    preference.AcceptedExchangeType),
                new AlertPreferencesDto(
                    preference.Notes ?? string.Empty,
                    preference.AlertOnMatch,
                    preference.Priority)),
            BuildProfileStatus(preference.ProfileStatus, completion),
            projection,
            BuildSmartRecommendation(preference, projection),
            preference.DraftSavedAt);
    }

    private async Task<MatchProjectionDto> BuildProjectionAsync(
        PurchasePreference preference,
        CancellationToken cancellationToken)
    {
        var publishedListings = dbContext.Listings
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Published && listing.DeletedAt == null);

        var directMatchQuery = publishedListings
            .Where(listing => listing.WasteType == preference.ResidueType
                && listing.Sector == preference.Sector
                && listing.ProductType == preference.ProductType);

        var potentialMatchQuery = publishedListings
            .Where(listing => listing.WasteType == preference.ResidueType
                || listing.Sector == preference.Sector);

        var suppliersCount = await potentialMatchQuery
            .Select(listing => listing.SellerId)
            .Distinct()
            .CountAsync(cancellationToken);
        var directMatchCount = await directMatchQuery.CountAsync(cancellationToken);
        var potentialMatchCount = await potentialMatchQuery.CountAsync(cancellationToken);
        var savings = directMatchCount > 0 ? 12 : potentialMatchCount > 0 ? 8 : 0;

        return new MatchProjectionDto(
            suppliersCount,
            directMatchCount,
            potentialMatchCount,
            savings > 0 ? $"Hasta {savings}% de ahorro potencial" : "Sin ahorro proyectado aun");
    }

    private static PurchasePreferenceResponseDto BuildEmptyState()
    {
        return new PurchasePreferenceResponseDto(
            new PurchasePreferenceFormValueDto(
                new DesiredResidueDto("organic", "agroindustry", "mango", string.Empty),
                new SourcingPreferencesDto(0, "tons", "weekly", null, null, "fresh"),
                new LogisticsPreferencesDto(string.Empty, 50, "pickup", "purchase"),
                new AlertPreferencesDto(string.Empty, false, "medium")),
            BuildProfileStatus(EmptyStatus, 0),
            new MatchProjectionDto(0, 0, 0, "Sin ahorro proyectado aun"),
            "Configura tus preferencias para recibir coincidencias de marketplace.",
            null);
    }

    private static ProfileStatusDto BuildProfileStatus(string status, int completion)
    {
        return status switch
        {
            ActiveStatus => new ProfileStatusDto(
                completion,
                "Alerta activa",
                "Tu preferencia esta activa",
                "Recibiras coincidencias cuando aparezcan publicaciones compatibles."),
            DraftStatus => new ProfileStatusDto(
                completion,
                "Preferencia guardada",
                "Aun puedes activar alertas",
                "Activa la alerta para priorizar coincidencias de marketplace."),
            _ => new ProfileStatusDto(
                completion,
                "Sin preferencias",
                "Completa tu perfil de compra",
                "Define material, volumen y logistica para mejorar coincidencias.")
        };
    }

    private static string BuildSmartRecommendation(
        PurchasePreference preference,
        MatchProjectionDto projection)
    {
        if (projection.DirectMatchCount > 0)
        {
            return "Hay coincidencias directas disponibles para esta preferencia.";
        }

        if (projection.PotentialMatchCount > 0)
        {
            return "Hay coincidencias parciales. Ajusta producto o sector para ampliar oportunidades.";
        }

        return preference.AlertOnMatch
            ? "La alerta esta activa. Te notificaremos cuando existan coincidencias."
            : "Activa alertas para recibir nuevas coincidencias automaticamente.";
    }

    private static int CalculateCompletionPercentage(PurchasePreference preference)
    {
        var completed = 0;
        const int total = 14;

        completed += HasValue(preference.ResidueType) ? 1 : 0;
        completed += HasValue(preference.Sector) ? 1 : 0;
        completed += HasValue(preference.ProductType) ? 1 : 0;
        completed += HasValue(preference.SpecificResidue) ? 1 : 0;
        completed += preference.RequiredVolume > 0 ? 1 : 0;
        completed += HasValue(preference.Unit) ? 1 : 0;
        completed += HasValue(preference.PurchaseFrequency) ? 1 : 0;
        completed += preference.MinPriceUsd.HasValue ? 1 : 0;
        completed += preference.MaxPriceUsd.HasValue ? 1 : 0;
        completed += HasValue(preference.DesiredCondition) ? 1 : 0;
        completed += HasValue(preference.ReceivingLocation) ? 1 : 0;
        completed += preference.RadiusKm > 0 ? 1 : 0;
        completed += HasValue(preference.PreferredMode) ? 1 : 0;
        completed += HasValue(preference.AcceptedExchangeType) ? 1 : 0;

        return (int)Math.Round(completed * 100m / total, MidpointRounding.AwayFromZero);
    }

    private static string ToUnitLabel(string value)
    {
        return value switch
        {
            "tons" => "Ton",
            "kg" => "Kg",
            "m3" => "m3",
            _ => value
        };
    }

    private static string ToFrequencyLabel(string value)
    {
        return value switch
        {
            "weekly" => "Semanal",
            "biweekly" => "Quincenal",
            "monthly" => "Mensual",
            "recurring" => "Recurrente",
            _ => "Unica compra"
        };
    }

    private static string ToPriorityLabel(string value)
    {
        return value switch
        {
            "high" => "Urgente",
            "low" => "Baja",
            _ => "Media"
        };
    }

    private static string? EmptyToNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    private static bool HasValue(string? value)
    {
        return !string.IsNullOrWhiteSpace(value);
    }
}
