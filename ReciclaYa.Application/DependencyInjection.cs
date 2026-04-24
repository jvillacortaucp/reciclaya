using Microsoft.Extensions.DependencyInjection;
using ReciclaYa.Application.Admin.Services;
using ReciclaYa.Application.Auth.Services;
using ReciclaYa.Application.CommercialRequests.Services;
using ReciclaYa.Application.Checkout.Services;
using ReciclaYa.Application.Dashboard.Services;
using ReciclaYa.Application.Listings.Services;
using ReciclaYa.Application.Messages.Services;
using ReciclaYa.Application.Orders.Services;
using ReciclaYa.Application.Payments.Services;
using ReciclaYa.Application.Profile.Services;
using ReciclaYa.Application.PreOrders.Services;
using ReciclaYa.Application.PurchasePreferences.Services;
using ReciclaYa.Application.Recommendations.Services;
using ReciclaYa.Application.ValorizationIdeas.Services;

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
        services.AddScoped<IRecommendationService, RecommendationService>();
        services.AddScoped<ICommercialRequestService, CommercialRequestService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IValorizationIdeaService, ValorizationIdeaService>();
        services.AddScoped<ICheckoutService, CheckoutService>();
        services.AddScoped<IPaymentProvider, SimulatedPaymentProvider>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}
