using Microsoft.EntityFrameworkCore;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Auth.Services;
using ReciclaYa.Application.Profile.Dtos;
using ReciclaYa.Application.Profile.Requests;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Profile.Services;

public sealed class ProfileService(IAuthDbContext dbContext) : IProfileService
{
    public async Task<AuthResult<ProfileDto>> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await GetUserWithProfileAsync(userId, cancellationToken);
        if (user is null)
        {
            return AuthResult<ProfileDto>.Fail(401, "User not found.", "USER_NOT_FOUND");
        }

        return AuthResult<ProfileDto>.Ok(ToDto(user));
    }

    public async Task<AuthResult<ProfileDto>> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await GetUserWithProfileAsync(userId, cancellationToken);
        if (user is null)
        {
            return AuthResult<ProfileDto>.Fail(401, "User not found.", "USER_NOT_FOUND");
        }

        var now = DateTimeOffset.UtcNow;
        ApplyUserUpdates(user, request, now);

        if (user.ProfileType == ProfileType.Company)
        {
            ApplyCompanyUpdates(user.Company, request, now);
        }

        if (user.ProfileType == ProfileType.Person)
        {
            ApplyPersonUpdates(user, request, now);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return AuthResult<ProfileDto>.Ok(ToDto(user), "Profile updated successfully.");
    }

    private async Task<User?> GetUserWithProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .Include(user => user.Company)
            .Include(user => user.PersonProfile)
            .FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }

    private static void ApplyUserUpdates(User user, UpdateProfileRequest request, DateTimeOffset now)
    {
        var fullName = TrimOrNull(request.FullName);
        if (fullName is not null)
        {
            user.FullName = fullName;
        }

        user.UpdatedAt = now;
    }

    private static void ApplyCompanyUpdates(Company? company, UpdateProfileRequest request, DateTimeOffset now)
    {
        if (company is null)
        {
            return;
        }

        var companyRequest = request.Company;
        company.BusinessName = Coalesce(companyRequest?.BusinessName, company.BusinessName);
        company.MobilePhone = Coalesce(companyRequest?.MobilePhone, request.MobilePhone, company.MobilePhone);
        company.Address = Coalesce(companyRequest?.Address, request.Address, company.Address);
        company.PostalCode = Coalesce(companyRequest?.PostalCode, request.PostalCode, company.PostalCode);
        company.LegalRepresentative = Coalesce(companyRequest?.LegalRepresentative, company.LegalRepresentative);
        company.Position = Coalesce(companyRequest?.Position, company.Position);
        company.UpdatedAt = now;
    }

    private static void ApplyPersonUpdates(User user, UpdateProfileRequest request, DateTimeOffset now)
    {
        var person = user.PersonProfile;
        if (person is null)
        {
            return;
        }

        var personRequest = request.PersonProfile;
        person.FirstName = Coalesce(personRequest?.FirstName, person.FirstName);
        person.LastName = Coalesce(personRequest?.LastName, person.LastName);
        person.MobilePhone = Coalesce(personRequest?.MobilePhone, request.MobilePhone, person.MobilePhone);
        person.Address = Coalesce(personRequest?.Address, request.Address, person.Address);
        person.PostalCode = Coalesce(personRequest?.PostalCode, request.PostalCode, person.PostalCode);
        person.UpdatedAt = now;

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = $"{person.FirstName} {person.LastName}".Trim();
        }
    }

    private static ProfileDto ToDto(User user)
    {
        return new ProfileDto(
            user.Id,
            user.Email,
            user.FullName,
            AuthFormatting.ToRoleValue(user.Role),
            AuthFormatting.ToProfileTypeValue(user.ProfileType),
            AuthFormatting.ToStatusValue(user.Status),
            user.Company is null ? null : ToCompanyDto(user.Company),
            user.PersonProfile is null ? null : ToPersonDto(user.PersonProfile));
    }

    private static ProfileCompanyDto ToCompanyDto(Company company)
    {
        return new ProfileCompanyDto(
            company.Id,
            company.Ruc,
            company.BusinessName,
            company.MobilePhone,
            company.Address,
            company.PostalCode,
            company.LegalRepresentative,
            company.Position,
            ToVerificationStatusValue(company.VerificationStatus));
    }

    private static ProfilePersonDto ToPersonDto(PersonProfile person)
    {
        return new ProfilePersonDto(
            person.Id,
            person.FirstName,
            person.LastName,
            person.DocumentNumber,
            person.MobilePhone,
            person.Address,
            person.PostalCode,
            ToVerificationStatusValue(person.VerificationStatus));
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

    private static string Coalesce(params string?[] values)
    {
        return values.Select(TrimOrNull).FirstOrDefault(value => value is not null) ?? string.Empty;
    }

    private static string? TrimOrNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
