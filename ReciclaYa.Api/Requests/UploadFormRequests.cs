namespace ReciclaYa.Api.Requests;

public sealed class UploadLogoFormRequest
{
    public IFormFile File { get; set; } = default!;
}

public sealed class UploadAvatarFormRequest
{
    public IFormFile File { get; set; } = default!;
}

public sealed class UploadListingMediaFormRequest
{
    public IFormFile File { get; set; } = default!;
    public string? Alt { get; set; }
    public int? SortOrder { get; set; }
}

public sealed class UploadMediaFormRequest
{
    public IFormFile File { get; set; } = default!;
    public string EntityType { get; set; } = default!;
    public Guid? EntityId { get; set; }
    public string Purpose { get; set; } = default!;
    public string Visibility { get; set; } = "public";
    public string? Alt { get; set; }
    public int? SortOrder { get; set; }
}
