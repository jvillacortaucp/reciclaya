using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Admin.Dtos;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Admin.Services;

public sealed class AdminCompanyService(IAuthDbContext dbContext) : IAdminCompanyService
{
    public async Task<IReadOnlyCollection<AdminCompanyDto>> GetCompaniesAsync(
        CancellationToken cancellationToken = default)
    {
        var companies = await dbContext.Companies
            .AsNoTracking()
            .OrderByDescending(company => company.CreatedAt)
            .ToListAsync(cancellationToken);

        return companies.Select(ToDto).ToArray();
    }

    public async Task<AdminCompanyDto?> VerifyCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await UpdateVerificationStatusAsync(id, VerificationStatus.Verified, cancellationToken);
    }

    public async Task<AdminCompanyDto?> RejectCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await UpdateVerificationStatusAsync(id, VerificationStatus.Rejected, cancellationToken);
    }

    private async Task<AdminCompanyDto?> UpdateVerificationStatusAsync(
        Guid id,
        VerificationStatus verificationStatus,
        CancellationToken cancellationToken)
    {
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (company is null)
        {
            return null;
        }

        company.VerificationStatus = verificationStatus;
        company.UpdatedAt = DateTimeOffset.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(company);
    }

    private static AdminCompanyDto ToDto(Company company)
    {
        return new AdminCompanyDto(
            company.Id,
            company.BusinessName,
            company.Ruc,
            ToVerificationStatusValue(company.VerificationStatus),
            company.CreatedAt);
    }

    private static string ToVerificationStatusValue(VerificationStatus verificationStatus)
    {
        return verificationStatus switch
        {
            VerificationStatus.Verified => "verified",
            VerificationStatus.Rejected => "rejected",
            _ => "pending"
        };
    }
}
