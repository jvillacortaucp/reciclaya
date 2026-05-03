namespace ReciclaYa.Application.Media.Options;

public sealed class SupabaseOptions
{
    public string Url { get; set; } = string.Empty;

    public string ServiceRoleKey { get; set; } = string.Empty;

    public string PublicBucket { get; set; } = "public-media";

    public string PrivateBucket { get; set; } = "private-media";
}
