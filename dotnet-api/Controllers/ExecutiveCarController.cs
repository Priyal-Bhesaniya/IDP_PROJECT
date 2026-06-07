using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;
using Microsoft.AspNetCore.Authorization;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExecutiveCarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExecutiveCarController> _logger;

        public ExecutiveCarController(ApplicationDbContext context, ILogger<ExecutiveCarController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ExecutiveCar/dealer/{dealerId}
        [HttpGet("dealer/{dealerId}")]
        public async Task<ActionResult<IEnumerable<ExecutiveCar>>> GetExecutiveCarsByDealer(int dealerId)
        {
            try
            {
                var cars = await _context.ExecutiveCars
                    .Where(c => c.DealerId == dealerId)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return Ok(cars);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving executive cars for dealer {DealerId}", dealerId);
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/ExecutiveCar/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExecutiveCar>> GetExecutiveCar(int id)
        {
            try
            {
                var car = await _context.ExecutiveCars.FindAsync(id);

                if (car == null)
                {
                    return NotFound();
                }

                return Ok(car);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving executive car {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/ExecutiveCar
        [HttpPost]
        public async Task<ActionResult<ExecutiveCar>> CreateExecutiveCar(CreateExecutiveCarDto carDto)
        {
            try
            {
                // Check if car number already exists for this dealer
                var existingCar = await _context.ExecutiveCars
                    .FirstOrDefaultAsync(c => c.CarNumber == carDto.CarNumber && c.DealerId == carDto.DealerId);

                if (existingCar != null)
                {
                    return BadRequest("Car number already exists for this dealer");
                }

                var executiveCar = new ExecutiveCar
                {
                    DealerId = carDto.DealerId,
                    Category = carDto.Category,
                    CarNumber = carDto.CarNumber,
                    MinKm = carDto.MinKm,
                    ExtraKm = carDto.ExtraKm,
                    MaxKm = carDto.MaxKm,
                    GearType = carDto.GearType,
                    FuelType = carDto.FuelType,
                    Seats = carDto.Seats,
                    PricePerDay = carDto.PricePerDay,
                    Status = carDto.Status,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = carDto.DealerId
                };

                _context.ExecutiveCars.Add(executiveCar);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetExecutiveCar), new { id = executiveCar.Id }, executiveCar);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating executive car");
                return StatusCode(500, "Internal server error");
            }
        }

        // PUT: api/ExecutiveCar/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExecutiveCar(int id, UpdateExecutiveCarDto carDto)
        {
            try
            {
                var executiveCar = await _context.ExecutiveCars.FindAsync(id);
                if (executiveCar == null)
                {
                    return NotFound();
                }

                // Check if car number already exists for this dealer (excluding current car)
                var existingCar = await _context.ExecutiveCars
                    .FirstOrDefaultAsync(c => c.CarNumber == carDto.CarNumber && c.DealerId == executiveCar.DealerId && c.Id != id);

                if (existingCar != null)
                {
                    return BadRequest("Car number already exists for this dealer");
                }

                executiveCar.Category = carDto.Category;
                executiveCar.CarNumber = carDto.CarNumber;
                executiveCar.MinKm = carDto.MinKm;
                executiveCar.ExtraKm = carDto.ExtraKm;
                executiveCar.MaxKm = carDto.MaxKm;
                executiveCar.GearType = carDto.GearType;
                executiveCar.FuelType = carDto.FuelType;
                executiveCar.Seats = carDto.Seats;
                executiveCar.PricePerDay = carDto.PricePerDay;
                executiveCar.Status = carDto.Status;
                executiveCar.UpdatedAt = DateTime.UtcNow;
                executiveCar.UpdatedBy = executiveCar.DealerId;

                _context.Entry(executiveCar).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating executive car {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // DELETE: api/ExecutiveCar/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExecutiveCar(int id)
        {
            try
            {
                var executiveCar = await _context.ExecutiveCars.FindAsync(id);
                if (executiveCar == null)
                {
                    return NotFound();
                }

                _context.ExecutiveCars.Remove(executiveCar);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting executive car {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // PATCH: api/ExecutiveCar/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateCarStatus(int id, [FromBody] string status)
        {
            try
            {
                var executiveCar = await _context.ExecutiveCars.FindAsync(id);
                if (executiveCar == null)
                {
                    return NotFound();
                }

                if (status != "active" && status != "inactive")
                {
                    return BadRequest("Status must be 'active' or 'inactive'");
                }

                executiveCar.Status = status;
                executiveCar.UpdatedAt = DateTime.UtcNow;
                executiveCar.UpdatedBy = executiveCar.DealerId;

                _context.Entry(executiveCar).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating executive car status {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
