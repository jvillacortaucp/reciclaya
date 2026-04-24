using Microsoft.Extensions.DependencyInjection;
using ReciclaYa.Application.Admin.Services;
using ReciclaYa.Application.Auth.Services;
using ReciclaYa.Application.Dashboard.Services;
using ReciclaYa.Application.Listings.Services;
using ReciclaYa.Application.Profile.Services;
using ReciclaYa.Application.PreOrders.Services;
using ReciclaYa.Application.PurchasePreferences.Services;

namespace ReciclaYa.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<IListingService, ListingService>();
        services.AddScoped<IAdminCompanyService, AdminCompanyService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IPurchasePreferenceService, PurchasePreferenceService>();
        services.AddScoped<IPreOrderService, PreOrderService>();

        return services;
    }
}
