using Microsoft.AspNetCore.Mvc;

namespace ReciclaYa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            service = "ReciclaYa.Api",
            status = "Healthy",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
