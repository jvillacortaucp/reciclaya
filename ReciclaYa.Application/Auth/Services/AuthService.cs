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
        if (!PasswordsMatch(request.Password, request.ConfirmPassword))
        {
            return AuthResult<AuthSessionDto>.Fail(400, "Passwords do not match.", "PASSWORD_MISMATCH");
        }

        var email = Normalize(request.Email);
        var ruc = request.Company.Ruc.Trim();

        if (await dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "Email is already registered.", "EMAIL_ALREADY_EXISTS");
        }

        if (await dbContext.Companies.AnyAsync(company => company.Ruc == ruc, cancellationToken))
        {
            return AuthResult<AuthSessionDto>.Fail(409, "RUC is already registered.", "RUC_ALREADY_EXISTS");
        }

        var now = DateTimeOffset.UtcNow;
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.Company.LegalRepresentative.Trim(),
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
                BusinessName = request.Company.BusinessName.Trim(),
                MobilePhone = request.Company.MobilePhone.Trim(),
                Address = request.Company.Address.Trim(),
                PostalCode = request.Company.PostalCode.Trim(),
                LegalRepresentative = request.Company.LegalRepresentative.Trim(),
                Position = request.Company.Position.Trim(),
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
        if (!PasswordsMatch(request.Password, request.ConfirmPassword))
        {
            return AuthResult<AuthSessionDto>.Fail(400, "Passwords do not match.", "PASSWORD_MISMATCH");
        }

        var email = Normalize(request.Email);
        var documentNumber = request.DocumentNumber.Trim();

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
        var firstName = request.FirstName.Trim();
        var lastName = request.LastName.Trim();
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
                MobilePhone = request.MobilePhone.Trim(),
                Address = request.Address.Trim(),
                PostalCode = request.PostalCode.Trim(),
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
            AuthFormatting.ToStatusValue(user.Status));
    }

    private static string Normalize(string value)
    {
        return value.Trim().ToLowerInvariant();
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
}
