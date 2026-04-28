using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Media.Options;
using ReciclaYa.Application.Media.Services;
using ReciclaYa.Application.Recommendations.Services;
using ReciclaYa.Application.ValueSectors.Services;
using ReciclaYa.Application.ValorizationIdeas.Services;
using ReciclaYa.Infrastructure.AI;
using ReciclaYa.Infrastructure.Options;
using ReciclaYa.Infrastructure.Persistence;
using ReciclaYa.Infrastructure.Storage;

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
        services.AddSingleton<IOptions<SupabaseOptions>>(_ =>
        {
            var section = configuration.GetSection("Supabase");
            var supabaseOptions = new SupabaseOptions
            {
                Url = section["Url"] ?? string.Empty,
                ServiceRoleKey = section["ServiceRoleKey"] ?? string.Empty,
                PublicBucket = section["PublicBucket"] ?? "public-media",
                PrivateBucket = section["PrivateBucket"] ?? "private-media"
            };

            return Microsoft.Extensions.Options.Options.Create(supabaseOptions);
        });
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
        services.AddScoped<IStorageService>(provider =>
        {
            var options = provider.GetRequiredService<IOptions<SupabaseOptions>>();
            var client = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(30)
            };

            if (!string.IsNullOrWhiteSpace(options.Value.Url))
            {
                client.BaseAddress = new Uri($"{options.Value.Url.TrimEnd('/')}/");
            }

            return new SupabaseStorageService(
                client,
                options,
                provider.GetRequiredService<ILogger<SupabaseStorageService>>());
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
        services.AddScoped<IRecommendationAiGenerator>(provider =>
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

            return new DeepSeekRecommendationGenerator(
                client,
                deepSeekOptions,
                provider.GetRequiredService<ILogger<DeepSeekRecommendationGenerator>>());
        });
        services.AddScoped<IValueSectorAiGenerator>(provider =>
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

            return new DeepSeekValueSectorGenerator(
                client,
                deepSeekOptions,
                provider.GetRequiredService<ILogger<DeepSeekValueSectorGenerator>>());
        });

        return services;
    }
}
