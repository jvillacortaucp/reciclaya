using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Infrastructure.Persistence;

namespace ReciclaYa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
        }

        services.AddDbContext<ReciclaYaDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });
        services.AddScoped<IAuthDbContext>(provider => provider.GetRequiredService<ReciclaYaDbContext>());

        return services;
    }
}
