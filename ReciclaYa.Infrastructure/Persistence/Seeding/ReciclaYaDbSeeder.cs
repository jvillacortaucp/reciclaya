using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Infrastructure.Persistence.Seeding;

public static class ReciclaYaDbSeeder
{
    private static readonly DemoUserSeed[] DemoUsers =
    [
        new(
            Email: "admin@reciclaya.pe",
            Password: "Admin123456",
            Role: UserRole.Admin,
            FullName: "ReciclaYa Admin",
            Ruc: "20111111111",
            BusinessName: "ReciclaYa Admin SAC",
            MobilePhone: "+51 900 000 001",
            Address: "Lima, Perú",
            PostalCode: "15001",
            LegalRepresentative: "Admin ReciclaYa",
            Position: "Administrador"),
        new(
            Email: "seller@reciclaya.pe",
            Password: "Seller123456",
            Role: UserRole.Seller,
            FullName: "Agroloop SAC",
            Ruc: "20222222222",
            BusinessName: "Agroloop SAC",
            MobilePhone: "+51 900 000 002",
            Address: "Av. Industrial 123, Lima",
            PostalCode: "15001",
            LegalRepresentative: "Diego Salazar",
            Position: "Gerente General"),
        new(
            Email: "buyer@reciclaya.pe",
            Password: "Buyer123456",
            Role: UserRole.Buyer,
            FullName: "EcoCompras SAC",
            Ruc: "20333333333",
            BusinessName: "EcoCompras SAC",
            MobilePhone: "+51 900 000 003",
            Address: "Av. Comercio 456, Lima",
            PostalCode: "15001",
            LegalRepresentative: "Camila Rojas",
            Position: "Jefa de Compras")
    ];

    public static async Task SeedDevelopmentDataAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ReciclaYaDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ReciclaYaDbContext>>();

        await dbContext.Database.MigrateAsync(cancellationToken);

        foreach (var seed in DemoUsers)
        {
            await UpsertDemoUserAsync(dbContext, logger, seed, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task UpsertDemoUserAsync(
        ReciclaYaDbContext dbContext,
        ILogger logger,
        DemoUserSeed seed,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var normalizedEmail = seed.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .Include(item => item.Company)
            .FirstOrDefaultAsync(item => item.Email == normalizedEmail, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = normalizedEmail,
                CreatedAt = now
            };

            dbContext.Users.Add(user);
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(seed.Password);
        user.FullName = seed.FullName;
        user.Role = seed.Role;
        user.ProfileType = ProfileType.Company;
        user.Status = UserStatus.Active;
        user.UpdatedAt = now;

        var company = user.Company ?? await dbContext.Companies
            .FirstOrDefaultAsync(item => item.Ruc == seed.Ruc, cancellationToken);

        if (company is not null && company.UserId != user.Id && company.UserId != Guid.Empty)
        {
            logger.LogWarning(
                "Skipping demo company seed for {Email}. RUC {Ruc} already belongs to user {UserId}.",
                seed.Email,
                seed.Ruc,
                company.UserId);
            return;
        }

        if (company is null)
        {
            company = new Company
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = now
            };

            dbContext.Companies.Add(company);
        }

        company.UserId = user.Id;
        company.Ruc = seed.Ruc;
        company.BusinessName = seed.BusinessName;
        company.MobilePhone = seed.MobilePhone;
        company.Address = seed.Address;
        company.PostalCode = seed.PostalCode;
        company.LegalRepresentative = seed.LegalRepresentative;
        company.Position = seed.Position;
        company.VerificationStatus = VerificationStatus.Verified;
        company.UpdatedAt = now;
    }

    private sealed record DemoUserSeed(
        string Email,
        string Password,
        UserRole Role,
        string FullName,
        string Ruc,
        string BusinessName,
        string MobilePhone,
        string Address,
        string PostalCode,
        string LegalRepresentative,
        string Position);
}
