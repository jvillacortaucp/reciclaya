using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReciclaYa.Api.Responses;
using ReciclaYa.Application.Orders.Dtos;
using ReciclaYa.Application.Orders.Services;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public sealed class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders(CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var orders = await orderService.GetOrdersAsync(userId, role, cancellationToken);
        return Ok(ApiResponse<IReadOnlyCollection<OrderListItemDto>>.Ok(orders));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetUserContext(out var userId, out var role))
        {
            return Unauthorized(ApiResponse<object>.Fail("Unauthorized.", ["INVALID_TOKEN_SUBJECT"]));
        }

        var order = await orderService.GetByIdAsync(id, userId, role, cancellationToken);
        return order is null
            ? NotFound(ApiResponse<object>.Fail("Order not found.", ["ORDER_NOT_FOUND"]))
            : Ok(ApiResponse<OrderDetailDto>.Ok(order));
    }

    private bool TryGetUserContext(out Guid userId, out string role)
    {
        var subject = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        role = User.FindFirst("role")?.Value ?? string.Empty;

        return Guid.TryParse(subject, out userId);
    }
}
