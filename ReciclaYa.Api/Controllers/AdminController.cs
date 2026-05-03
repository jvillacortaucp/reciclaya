using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Admin.Dtos;
using ReciclaYa.Application.Admin.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize(Roles = "admin")]
[Route("api/admin")]
public sealed class AdminController(IAdminCompanyService adminCompanyService) : ControllerBase
{
    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies(CancellationToken cancellationToken)
    {
        var companies = await adminCompanyService.GetCompaniesAsync(cancellationToken);

        return Ok(ApiResponse<IReadOnlyCollection<AdminCompanyDto>>.Ok(companies));
    }

    [HttpPatch("companies/{id:guid}/verify")]
    public async Task<IActionResult> VerifyCompany(
        Guid id,
        CancellationToken cancellationToken)
    {
        var company = await adminCompanyService.VerifyCompanyAsync(id, cancellationToken);

        if (company is null)
        {
            return NotFound(ApiResponse<object>.Fail("Company not found.", ["COMPANY_NOT_FOUND"]));
        }

        return Ok(ApiResponse<AdminCompanyDto>.Ok(company, "Company verified."));
    }

    [HttpPatch("companies/{id:guid}/reject")]
    public async Task<IActionResult> RejectCompany(
        Guid id,
        CancellationToken cancellationToken)
    {
        var company = await adminCompanyService.RejectCompanyAsync(id, cancellationToken);

        if (company is null)
        {
            return NotFound(ApiResponse<object>.Fail("Company not found.", ["COMPANY_NOT_FOUND"]));
        }

        return Ok(ApiResponse<AdminCompanyDto>.Ok(company, "Company rejected."));
    }
}
