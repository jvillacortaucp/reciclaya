using ReciclaYa.Application.Admin.Dtos;

namespace ReciclaYa.Application.Admin.Services;

public interface IAdminCompanyService
{
    Task<IReadOnlyCollection<AdminCompanyDto>> GetCompaniesAsync(
        CancellationToken cancellationToken = default);

    Task<AdminCompanyDto?> VerifyCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<AdminCompanyDto?> RejectCompanyAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
