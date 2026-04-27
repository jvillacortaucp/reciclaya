using ReciclaYa.Domain.Entities;
using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Application.Auth.Services;

public sealed class PermissionService : IPermissionService
{
    private static readonly string[] AdminPermissions =
    [
        "view:dashboard",
        "manage:waste",
        "manage:preferences",
        "view:my-listings",
        "view:requests",
        "view:messages",
        "view:marketplace",
        "create:preorder",
        "view:recommendations",
        "manage:profile"
    ];

    private static readonly string[] BuyerPermissions =
    [
        "view:dashboard",
        "manage:preferences",
        "view:marketplace",
        "view:my-listings",
        "view:requests",
        "create:preorder",
        "view:recommendations",
        "view:messages",
        "manage:profile"
    ];

    private static readonly string[] SellerPermissions =
    [
        "view:dashboard",
        "manage:waste",
        "manage:preferences",
        "view:my-listings",
        "view:requests",
        "view:marketplace",
        "create:preorder",
        "view:messages",
        "manage:profile"
    ];

    public IReadOnlyCollection<string> GetPermissions(User user)
    {
        return user.Role switch
        {
            UserRole.Admin => AdminPermissions,
            UserRole.Seller => SellerPermissions,
            _ => BuyerPermissions
        };
    }
}
