using ReciclaYa.Domain.Enums;

namespace ReciclaYa.Domain.Entities;

public sealed class UserRegulationProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public RegulationLevel CurrentLevel { get; set; } = RegulationLevel.Level0;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
