using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Abstractions.Persistence;
using ReciclaYa.Application.Auth.Dtos;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Auth.Requests;
using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Auth.Services;

public sealed class AuthService(
    IAuthDbContext dbContext,
    IJwtTokenService jwtTokenService,
    IPermissionService permissionService,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;

    public async Task<AuthResult<AuthSessionDto>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = Normalize(request.Email);
        var user = await dbContext.Users
            .FirstOrDefaultAsync(item => item.Email == email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return AuthResult<AuthSessionDto>.Fail(401, "Invalid credentials.", "INVALID_CREDENTIALS");
        }

        if (user.Status != UserStatus.Active)
        {
            return AuthResult<AuthSessionDto>.Fail(403, "User is not active.", "USER_NOT_ACTIVE");
        }

        var session = await CreateSessionAsync(user, cancellationToken);

        return AuthResult<AuthSessionDto>.Ok(session);
    }

    public async Task<AuthResult<AuthSessionDto>> RegisterCompanyAsync(
        RegisterCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        var companyValidationErrors = ValidateCompanyRequest(request);
        if (companyValidationErrors.Count > 0)
        {
            return AuthResult<AuthSessionDto>.Fail(400, companyValidationErrors[0], companyValidationErrors.ToArray());
        }

        if (!PasswordsMatch(request.Password, request.ConfirmPassword))
        {
            return AuthResult<AuthSessionDto>.Fail(400, "Passwords do not match.", "PASSWORD_MISMATCH");
        }

        var email = Normalize(request.Email);
        var ruc = InputValidation.NormalizeText(request.Company.Ruc);
        var businessName = InputValidation.NormalizeText(request.Company.BusinessName);
        var mobilePhone = InputValidation.NormalizeText(request.Company.MobilePhone);
        var address = InputValidation.NormalizeText(request.Company.Address);
        var postalCode = InputValidation.NormalizeText(request.Company.PostalCode);
        var legalRepresentative = InputValidation.NormalizeText(request.Company.LegalRepresentative);
        var position = InputValidation.NormalizeText(request.Company.Position);

        if (await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "Email is already registered.", "EMAIL_ALREADY_EXISTS");
        }

        if (await dbContext.Companies.AnyAsync(company => company.Ruc == ruc, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "RUC is already registered.", "RUC_ALREADY_EXISTS");
        }

        if (await dbContext.Companies.AnyAsync(
                company => company.BusinessName == businessName
                    && company.LegalRepresentative == legalRepresentative
                    && company.MobilePhone == mobilePhone,
                cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(
                409,
                "A company with the same identity details is already registered.",
                "COMPANY_IDENTITY_ALREADY_EXISTS");
        }

        var now = DateTimeOffset.UtcNow;
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = legalRepresentative,
            Role = ResolveRole(request.Intent),
            ProfileType = ProfileType.Company,
            Status = UserStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
            Company = new Company
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Ruc = ruc,
                BusinessName = businessName,
                MobilePhone = mobilePhone,
                Address = address,
                PostalCode = postalCode,
                LegalRepresentative = legalRepresentative,
                Position = position,
                VerificationStatus = VerificationStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        dbContext.Users.Add(user);
        var session = await CreateSessionAsync(user, cancellationToken);

        return AuthResult<AuthSessionDto>.Ok(session, "Company registered successfully.");
    }

    public async Task<AuthResult<AuthSessionDto>> RegisterPersonAsync(
        RegisterPersonRequest request,
        CancellationToken cancellationToken = default)
    {
        var personValidationErrors = ValidatePersonRequest(request);
        if (personValidationErrors.Count > 0)
        {
            return AuthResult<AuthSessionDto>.Fail(400, personValidationErrors[0], personValidationErrors.ToArray());
        }

        if (!PasswordsMatch(request.Password, request.ConfirmPassword))
        {
            return AuthResult<AuthSessionDto>.Fail(400, "Passwords do not match.", "PASSWORD_MISMATCH");
        }

        var email = Normalize(request.Email);
        var documentNumber = InputValidation.NormalizeText(request.DocumentNumber);
        var mobilePhone = InputValidation.NormalizeText(request.MobilePhone);
        var address = InputValidation.NormalizeText(request.Address);
        var postalCode = InputValidation.NormalizeText(request.PostalCode);

        if (await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "Email is already registered.", "EMAIL_ALREADY_EXISTS");
        }

        if (await dbContext.PersonProfiles.AnyAsync(profile => profile.DocumentNumber == documentNumber, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "Document number is already registered.", "DOCUMENT_ALREADY_EXISTS");
        }

        var now = DateTimeOffset.UtcNow;
        var userId = Guid.NewGuid();
        var firstName = InputValidation.NormalizeText(request.FirstName);
        var lastName = InputValidation.NormalizeText(request.LastName);

        if (await dbContext.PersonProfiles.AnyAsync(
                profile => profile.FirstName == firstName
                    && profile.LastName == lastName
                    && profile.MobilePhone == mobilePhone,
                cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(
                409,
                "A user with the same identity details is already registered.",
                "PERSON_IDENTITY_ALREADY_EXISTS");
        }

        var user = new User
        {
            Id = userId,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = $"{firstName} {lastName}".Trim(),
            Role = ResolveRole(request.Intent),
            ProfileType = ProfileType.Person,
            Status = UserStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
            PersonProfile = new PersonProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FirstName = firstName,
                LastName = lastName,
                DocumentNumber = documentNumber,
                MobilePhone = mobilePhone,
                Address = address,
                PostalCode = postalCode,
                VerificationStatus = VerificationStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        dbContext.Users.Add(user);
        var session = await CreateSessionAsync(user, cancellationToken);

        return AuthResult<AuthSessionDto>.Ok(session, "Person registered successfully.");
    }

    public async Task<AuthResult<AuthSessionDto>> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        var existingRefreshToken = await dbContext.RefreshTokens
            .Include(refreshToken => refreshToken.User)
            .FirstOrDefaultAsync(refreshToken => refreshToken.Token == request.RefreshToken, cancellationToken);

        if (existingRefreshToken is null)
        {
            return AuthResult<AuthSessionDto>.Fail(401, "Refresh token is invalid.", "INVALID_REFRESH_TOKEN");
        }

        if (existingRefreshToken.RevokedAt is not null)
        {
            return AuthResult<AuthSessionDto>.Fail(401, "Refresh token has been revoked.", "REFRESH_TOKEN_REVOKED");
        }

        if (existingRefreshToken.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return AuthResult<AuthSessionDto>.Fail(401, "Refresh token has expired.", "REFRESH_TOKEN_EXPIRED");
        }

        if (existingRefreshToken.User.Status != UserStatus.Active)
        {
            return AuthResult<AuthSessionDto>.Fail(403, "User is not active.", "USER_NOT_ACTIVE");
        }

        existingRefreshToken.RevokedAt = DateTimeOffset.UtcNow;
        existingRefreshToken.RevokedReason = "Rotated";
        existingRefreshToken.UpdatedAt = DateTimeOffset.UtcNow;

        var session = await CreateSessionAsync(existingRefreshToken.User, cancellationToken);

        return AuthResult<AuthSessionDto>.Ok(session);
    }

    public async Task<AuthResult<MeDto>> GetMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);

        if (user is null)
        {
            return AuthResult<MeDto>.Fail(401, "User not found.", "USER_NOT_FOUND");
        }

        if (user.Status != UserStatus.Active)
        {
            return AuthResult<MeDto>.Fail(403, "User is not active.", "USER_NOT_ACTIVE");
        }

        var data = new MeDto(ToUserDto(user), permissionService.GetPermissions(user));

        return AuthResult<MeDto>.Ok(data);
    }

    private async Task<AuthSessionDto> CreateSessionAsync(User user, CancellationToken cancellationToken)
    {
        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshToken = jwtTokenService.GenerateRefreshToken();
        var now = DateTimeOffset.UtcNow;

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = now.AddDays(_jwtSettings.RefreshTokenExpiresDays),
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthSessionDto(
            accessToken.Token,
            refreshToken,
            accessToken.ExpiresAt,
            ToUserDto(user),
            permissionService.GetPermissions(user));
    }

    private static AuthUserDto ToUserDto(User user)
    {
        return new AuthUserDto(
            user.Id,
            user.Email,
            user.FullName,
            AuthFormatting.ToRoleValue(user.Role),
            AuthFormatting.ToProfileTypeValue(user.ProfileType),
            AuthFormatting.ToStatusValue(user.Status),
            user.AvatarUrl);
    }

    private static string Normalize(string value)
    {
        return InputValidation.NormalizeText(value).ToLowerInvariant();
    }

    private static bool PasswordsMatch(string password, string confirmPassword)
    {
        return string.Equals(password, confirmPassword, StringComparison.Ordinal);
    }

    private static UserRole ResolveRole(string intent)
    {
        var normalizedIntent = Normalize(intent);

        return normalizedIntent is "sell" or "seller" or "both" ? UserRole.Seller : UserRole.Buyer;
    }

    private static List<string> ValidateCompanyRequest(RegisterCompanyRequest request)
    {
        var errors = new List<string>();

        AddIfNotNull(errors, InputValidation.ValidateEmail(request.Email));
        AddIfNotNull(errors, InputValidation.ValidateRuc(request.Company.Ruc));
        AddIfNotNull(errors, InputValidation.ValidateBusinessName(request.Company.BusinessName));
        AddIfNotNull(errors, InputValidation.ValidatePhone(request.Company.MobilePhone));
        AddIfNotNull(errors, InputValidation.ValidateAddress(request.Company.Address));
        AddIfNotNull(errors, InputValidation.ValidatePostalCode(request.Company.PostalCode));
        AddIfNotNull(errors, InputValidation.ValidatePersonName(request.Company.LegalRepresentative, "Legal representative"));
        AddIfNotNull(errors, InputValidation.ValidatePosition(request.Company.Position));

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            errors.Add("Password must contain at least 8 characters.");
        }

        return errors;
    }

    private static List<string> ValidatePersonRequest(RegisterPersonRequest request)
    {
        var errors = new List<string>();

        AddIfNotNull(errors, InputValidation.ValidateEmail(request.Email));
        AddIfNotNull(errors, InputValidation.ValidatePersonName(request.FirstName, "First name"));
        AddIfNotNull(errors, InputValidation.ValidatePersonName(request.LastName, "Last name"));
        AddIfNotNull(errors, InputValidation.ValidateDocumentNumber(request.DocumentNumber));
        AddIfNotNull(errors, InputValidation.ValidatePhone(request.MobilePhone));
        AddIfNotNull(errors, InputValidation.ValidateAddress(request.Address));
        AddIfNotNull(errors, InputValidation.ValidatePostalCode(request.PostalCode));

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            errors.Add("Password must contain at least 8 characters.");
        }

        return errors;
    }

    private static void AddIfNotNull(List<string> errors, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            errors.Add(value);
        }
    }
}
