using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;
using dotnet_api.DTOs;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowEverything")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ServicesController> _logger;

        public ServicesController(ApplicationDbContext context, ILogger<ServicesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/services
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServices()
        {
            try
            {
                var services = await _context.Services
                    .Include(s => s.DealerServiceVehicles)
                    .ThenInclude(dsv => dsv.Vehicle)
                    .ToListAsync();
                
                var serviceDTOs = services.Select(s => new ServiceDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    EstimatedTime = s.EstimatedTime,
                    RentalAllowed = s.RentalAllowed,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    DealerId = s.DealerId,
                    DealerServiceVehicles = s.DealerServiceVehicles.Select(dsv => new DealerServiceVehicleDTO
                    {
                        Id = dsv.Id,
                        Price = dsv.Price,
                        CreatedAt = dsv.CreatedAt,
                        UpdatedAt = dsv.UpdatedAt,
                        DealerId = dsv.DealerId,
                        ServiceId = dsv.ServiceId,
                        VehicleId = dsv.VehicleId,
                        Vehicle = dsv.Vehicle != null ? new VehicleDTO
                        {
                            Id = dsv.Vehicle.Id,
                            Brand = dsv.Vehicle.Brand,
                            Type = dsv.Vehicle.Type,
                            CreatedAt = dsv.Vehicle.CreatedAt
                        } : null
                    }).ToList()
                }).ToList();
                
                return Ok(serviceDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving services");
                return StatusCode(500, "Error retrieving services from database");
            }
        }

        // GET: api/services/dealer/{dealerId}
        [HttpGet("dealer/{dealerId}")]
        public async Task<ActionResult<IEnumerable<ServiceDTO>>> GetServicesByDealer(int dealerId)
        {
            try
            {
                var services = await _context.Services
                    .Where(s => s.DealerId == dealerId)
                    .Include(s => s.DealerServiceVehicles
                        .Where(dsv => dsv.DealerId == dealerId))
                    .ThenInclude(dsv => dsv.Vehicle)
                    .ToListAsync();
                
                _logger.LogInformation("Found {Count} services for dealer {DealerId}", services.Count, dealerId);
                foreach (var service in services)
                {
                    _logger.LogInformation("Service ID: {Id}, Name: {Name}, Status: {Status}", service.Id, service.Name, service.Status);
                    _logger.LogInformation("Service {ServiceId} has {VehicleCount} vehicles", service.Id, service.DealerServiceVehicles.Count);
                    foreach (var dsv in service.DealerServiceVehicles)
                    {
                        _logger.LogInformation("  - Vehicle ID: {VehicleId}, Brand: {Brand}, Type: {Type}, Price: {Price}", 
                            dsv.VehicleId, dsv.Vehicle?.Brand, dsv.Vehicle?.Type, dsv.Price);
                    }
                }
                
                var serviceDTOs = services.Select(s => new ServiceDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    EstimatedTime = s.EstimatedTime,
                    RentalAllowed = s.RentalAllowed,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    DealerId = s.DealerId,
                    DealerServiceVehicles = s.DealerServiceVehicles.Select(dsv => new DealerServiceVehicleDTO
                    {
                        Id = dsv.Id,
                        Price = dsv.Price,
                        CreatedAt = dsv.CreatedAt,
                        UpdatedAt = dsv.UpdatedAt,
                        DealerId = dsv.DealerId,
                        ServiceId = dsv.ServiceId,
                        VehicleId = dsv.VehicleId,
                        Vehicle = dsv.Vehicle != null ? new VehicleDTO
                        {
                            Id = dsv.Vehicle.Id,
                            Brand = dsv.Vehicle.Brand,
                            Type = dsv.Vehicle.Type,
                            CreatedAt = dsv.Vehicle.CreatedAt
                        } : null
                    }).ToList()
                }).ToList();
                
                return Ok(serviceDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving services for dealer {DealerId}", dealerId);
                return StatusCode(500, "Error retrieving services from database");
            }
        }

        // GET: api/services/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetService(int id)
        {
            try
            {
                var service = await _context.Services
                    .Include(s => s.DealerServiceVehicles)
                    .ThenInclude(dsv => dsv.Vehicle)
                    .FirstOrDefaultAsync(s => s.Id == id);
                    
                if (service == null)
                {
                    return NotFound();
                }
                
                return Ok(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving service {ServiceId}", id);
                return StatusCode(500, "Error retrieving service from database");
            }
        }

        // POST: api/services
        [HttpPost]
        public async Task<ActionResult<ServiceDTO>> CreateService([FromBody] CreateServiceRequest request)
        {
            try
            {
                var service = new Service
                {
                    Name = request.Name,
                    EstimatedTime = request.EstimatedTime,
                    RentalAllowed = request.RentalAllowed,
                    Status = "Active",
                    DealerId = request.DealerId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                // Add vehicle prices if provided
                if (request.VehiclePrices != null && request.VehiclePrices.Any())
                {
                    foreach (var vehiclePrice in request.VehiclePrices)
                    {
                        var dealerServiceVehicle = new DealerServiceVehicle
                        {
                            ServiceId = service.Id,
                            VehicleId = vehiclePrice.VehicleId,
                            DealerId = request.DealerId,
                            Price = vehiclePrice.Price,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.DealerServiceVehicles.Add(dealerServiceVehicle);
                    }
                    await _context.SaveChangesAsync();
                }

                // Reload service with related data
                await _context.Entry(service)
                    .Collection(s => s.DealerServiceVehicles)
                    .Query()
                    .Include(dsv => dsv.Vehicle)
                    .LoadAsync();

                return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating service");
                return StatusCode(500, "Error creating service");
            }
        }

        // PUT: api/services/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Service>> UpdateService(int id, [FromBody] UpdateServiceRequest request)
        {
            try
            {
                var service = await _context.Services
                    .Include(s => s.DealerServiceVehicles)
                    .FirstOrDefaultAsync(s => s.Id == id);
                    
                if (service == null)
                {
                    return NotFound();
                }

                // Update service properties
                if (request.Name != null) service.Name = request.Name;
                if (request.EstimatedTime != null) service.EstimatedTime = request.EstimatedTime;
                if (request.RentalAllowed.HasValue) service.RentalAllowed = request.RentalAllowed.Value;
                if (request.Status != null) service.Status = request.Status;
                
                service.UpdatedAt = DateTime.UtcNow;

                // Update vehicle prices if provided
                if (request.VehiclePrices != null)
                {
                    // Remove existing vehicle prices
                    _context.DealerServiceVehicles.RemoveRange(service.DealerServiceVehicles);
                    
                    // Add new vehicle prices
                    foreach (var vehiclePrice in request.VehiclePrices)
                    {
                        var dealerServiceVehicle = new DealerServiceVehicle
                        {
                            ServiceId = service.Id,
                            VehicleId = vehiclePrice.VehicleId,
                            DealerId = service.DealerId,
                            Price = vehiclePrice.Price,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.DealerServiceVehicles.Add(dealerServiceVehicle);
                    }
                }

                await _context.SaveChangesAsync();

                // Reload service with related data
                await _context.Entry(service)
                    .Collection(s => s.DealerServiceVehicles)
                    .Query()
                    .Include(dsv => dsv.Vehicle)
                    .LoadAsync();

                return Ok(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service {ServiceId}", id);
                return StatusCode(500, "Error updating service");
            }
        }

        // PATCH: api/services/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateServiceStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    return NotFound();
                }

                service.Status = request.Status;
                service.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(service);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating service status {ServiceId}", id);
                return StatusCode(500, "Error updating service status");
            }
        }

        // DELETE: api/services/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            try
            {
                var service = await _context.Services.FindAsync(id);
                if (service == null)
                {
                    return NotFound();
                }

                // Remove related dealer service vehicles first
                var relatedVehicles = await _context.DealerServiceVehicles
                    .Where(dsv => dsv.ServiceId == id)
                    .ToListAsync();
                _context.DealerServiceVehicles.RemoveRange(relatedVehicles);

                _context.Services.Remove(service);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting service {ServiceId}", id);
                return StatusCode(500, "Error deleting service");
            }
        }

        // GET: api/vehicles
        [HttpGet("~/api/vehicles")]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            try
            {
                var vehicles = await _context.Vehicles.ToListAsync();
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving vehicles");
                return StatusCode(500, "Error retrieving vehicles from database");
            }
        }

        // Request DTOs
        public class CreateServiceRequest
        {
            public string Name { get; set; } = string.Empty;
            public string EstimatedTime { get; set; } = string.Empty;
            public bool RentalAllowed { get; set; }
            public int DealerId { get; set; }
            public List<VehiclePriceRequest>? VehiclePrices { get; set; }
        }

        public class UpdateServiceRequest
        {
            public string? Name { get; set; }
            public string? EstimatedTime { get; set; }
            public bool? RentalAllowed { get; set; }
            public string? Status { get; set; }
            public List<VehiclePriceRequest>? VehiclePrices { get; set; }
        }

        public class VehiclePriceRequest
        {
            public int VehicleId { get; set; }
            public decimal Price { get; set; }
        }

        public class StatusUpdateRequest
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
