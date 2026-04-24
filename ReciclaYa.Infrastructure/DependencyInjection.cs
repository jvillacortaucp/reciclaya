using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.ValorizationIdeas.Services;
using ReciclaYa.Infrastructure.AI;
using ReciclaYa.Infrastructure.Options;
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
        services.AddSingleton<IOptions<DeepSeekOptions>>(_ =>
        {
            var section = configuration.GetSection("DeepSeek");
            var deepSeekOptions = new DeepSeekOptions
            {
                ApiKey = section["ApiKey"] ?? string.Empty,
                BaseUrl = section["BaseUrl"] ?? "https://api.deepseek.com",
                Model = section["Model"] ?? "deepseek-chat"
            };

            return Microsoft.Extensions.Options.Options.Create(deepSeekOptions);
        });
        services.AddScoped<IValorizationIdeaGenerator>(provider =>
        {
            var deepSeekOptions = provider.GetRequiredService<IOptions<DeepSeekOptions>>();
            var baseUrl = string.IsNullOrWhiteSpace(deepSeekOptions.Value.BaseUrl)
                ? "https://api.deepseek.com"
                : deepSeekOptions.Value.BaseUrl;

            var client = new HttpClient
            {
                BaseAddress = new Uri($"{baseUrl.TrimEnd('/')}/"),
                Timeout = TimeSpan.FromSeconds(25)
            };

            return new DeepSeekValorizationIdeaGenerator(
                client,
                deepSeekOptions,
                provider.GetRequiredService<ILogger<DeepSeekValorizationIdeaGenerator>>());
        });

        return services;
    }
}
