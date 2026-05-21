namespace ReciclaYa.Application.Auth.Models;

public sealed class GoogleAuthSettings
{
    public string ClientId { get; set; } = string.Empty;

    public string ClientSecret { get; set; } = string.Empty;

    public string BackendCallbackUrl { get; set; } = string.Empty;

    public string FrontendSuccessUrl { get; set; } = string.Empty;

    public string FrontendErrorUrl { get; set; } = string.Empty;

    public string Scopes { get; set; } = "openid email profile";
}
