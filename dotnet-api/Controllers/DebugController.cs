using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebugController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DebugController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("debug-vehicles")]
        public async Task<IActionResult> GetDebugVehicles()
        {
            try
            {
                var vehicles = await _context.Vehicles.ToListAsync();
                var vehicleList = vehicles.Select(v => new {
                    v.Id,
                    v.Brand,
                    v.Type,
                    v.CreatedAt
                }).ToList();

                return Ok(new { 
                    total = vehicleList.Count,
                    vehicles = vehicleList 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
