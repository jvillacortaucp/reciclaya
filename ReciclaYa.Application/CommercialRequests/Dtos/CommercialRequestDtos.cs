namespace ReciclaYa.Application.CommercialRequests.Dtos;

public sealed record CreateCommercialRequestDto(
    Guid ListingId,
    string? Message);

public sealed record CommercialRequestDto(
    Guid Id,
    Guid ListingId,
    string ListingTitle,
    Guid BuyerId,
    string BuyerName,
    Guid SellerId,
    string SellerName,
    string? Message,
    string Status,
    DateTime CreatedAt);
