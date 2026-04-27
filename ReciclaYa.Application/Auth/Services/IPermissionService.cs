using ReciclaYa.Domain.Entities;

namespace ReciclaYa.Application.Auth.Services;

public interface IPermissionService
{
    IReadOnlyCollection<string> GetPermissions(User user);
}
