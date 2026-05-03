using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Auth.Services;

internal static class AuthFormatting
{
    public static string ToRoleValue(UserRole role)
    {
        return role switch
        {
            UserRole.Admin => "admin",
            UserRole.Seller => "seller",
            _ => "buyer"
        };
    }

    public static string ToProfileTypeValue(ProfileType profileType)
    {
        return profileType switch
        {
            ProfileType.Person => "person",
            _ => "company"
        };
    }

    public static string ToStatusValue(UserStatus status)
    {
        return status switch
        {
            UserStatus.Inactive => "inactive",
            UserStatus.Suspended => "suspended",
            _ => "active"
        };
    }
}
