using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using ReciclaYa.Application.Auth.Models;
using ReciclaYa.Application.Auth.Services;

namespace ReciclaYa.Infrastructure.Auth;

public sealed class GoogleIdentityService(IOptions<GoogleAuthSettings> googleOptions) : IGoogleIdentityService
{
    private readonly GoogleAuthSettings _settings = googleOptions.Value;

    public async Task<GoogleUserInfo?> ExchangeCodeForUserAsync(string code, CancellationToken cancellationToken = default)
    {
        using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };

        var tokenRequest = new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = _settings.ClientId,
            ["client_secret"] = _settings.ClientSecret,
            ["redirect_uri"] = _settings.BackendCallbackUrl,
            ["grant_type"] = "authorization_code"
        };

        using var tokenResponse = await httpClient.PostAsync(
            "https://oauth2.googleapis.com/token",
            new FormUrlEncodedContent(tokenRequest),
            cancellationToken);

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return null;
        }

        using var tokenStream = await tokenResponse.Content.ReadAsStreamAsync(cancellationToken);
        var tokenPayload = await JsonSerializer.DeserializeAsync<GoogleTokenResponse>(tokenStream, cancellationToken: cancellationToken);
        if (string.IsNullOrWhiteSpace(tokenPayload?.AccessToken))
        {
            return null;
        }

        using var userInfoRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
        userInfoRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenPayload.AccessToken);
        using var userInfoResponse = await httpClient.SendAsync(userInfoRequest, cancellationToken);

        if (!userInfoResponse.IsSuccessStatusCode)
        {
            return null;
        }

        using var userInfoStream = await userInfoResponse.Content.ReadAsStreamAsync(cancellationToken);
        var userInfo = await JsonSerializer.DeserializeAsync<GoogleUserInfoResponse>(userInfoStream, cancellationToken: cancellationToken);
        if (string.IsNullOrWhiteSpace(userInfo?.Email))
        {
            return null;
        }

        return new GoogleUserInfo(
            userInfo.Email,
            userInfo.Name,
            userInfo.Picture,
            userInfo.EmailVerified);
    }

    private sealed record GoogleTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; init; } = string.Empty;
    }

    private sealed record GoogleUserInfoResponse
    {
        [JsonPropertyName("email")]
        public string Email { get; init; } = string.Empty;

        [JsonPropertyName("email_verified")]
        public bool EmailVerified { get; init; }

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("picture")]
        public string? Picture { get; init; }
    }
}
