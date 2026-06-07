using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowEverything")]
    public class DealersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DealersController> _logger;

        public DealersController(ApplicationDbContext context, ILogger<DealersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/dealers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dealer>>> GetDealers()
        {
            try
            {
                var dealers = await _context.Dealers.ToListAsync();
                return Ok(dealers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving dealers");
                return StatusCode(500, "Error retrieving dealers from database");
            }
        }

        // GET: api/dealers/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetDealerStats()
        {
            try
            {
                var totalDealers = await _context.Dealers.CountAsync();
                var activeDealers = await _context.Dealers.CountAsync(d => d.Status == "Active");
                var inactiveDealers = await _context.Dealers.CountAsync(d => d.Status == "Inactive");
                
                return Ok(new {
                    Total = totalDealers,
                    Active = activeDealers,
                    Inactive = inactiveDealers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error retrieving dealer stats");
                return StatusCode(500, "Error retrieving dealer statistics");
            }
        }

        // GET: api/dealers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Dealer>> GetDealer(int id)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null)
            {
                return NotFound();
            }
            return Ok(dealer);
        }

        // GET: api/dealers/by-mobile/{mobileNumber}
        [HttpGet("by-mobile/{mobileNumber}")]
        public async Task<ActionResult<Dealer>> GetDealerByMobileNumber(string mobileNumber)
        {
            // Debug: Log all mobile numbers in database
            var allMobileNumbers = await _context.Dealers.Select(d => d.Phone).ToListAsync();
            _logger.LogInformation($"Looking for dealer with mobile: {mobileNumber}");
            _logger.LogInformation($"Available mobile numbers in database: [{string.Join(", ", allMobileNumbers)}]");
            
            var dealer = await _context.Dealers.FirstOrDefaultAsync(d => d.Phone == mobileNumber);
            if (dealer == null)
            {
                _logger.LogWarning($"Dealer not found with mobile: {mobileNumber}");
                return NotFound();
            }
            
            _logger.LogInformation($"Found dealer: {dealer?.Name} with mobile: {dealer?.Phone}");
            return Ok(dealer);
        }

        // POST: api/dealers
        [HttpPost]
        public async Task<ActionResult<Dealer>> CreateDealer([FromBody] CreateDealerRequest request)
        {
            var dealer = new Dealer
            {
                Name = request.Name,
                OwnerName = request.OwnerName,
                RegistrationNumber = request.RegistrationNumber,
                GstNumber = request.GstNumber,
                Address = request.Address,
                Phone = request.Phone,
                Status = "Active",
                OpeningTime = request.OpeningTime,
                ClosingTime = request.ClosingTime,
                RentalEnabled = request.RentalEnabled,
                JoinedDate = DateTime.Now,
                Role = request.Role,
                GarageLogo = request.GarageLogo,
                ServiceImages = request.ServiceImages ?? new List<string>(),
                RentalImages = request.RentalImages ?? new List<string>(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Dealers.Add(dealer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDealer), new { id = dealer.Id }, dealer);
        }

        // PUT: api/dealers/5 (EDIT FUNCTIONALITY)
        [HttpPut("{id}")]
        public async Task<ActionResult<Dealer>> UpdateDealer(int id, [FromBody] UpdateDealerRequest request)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided
            if (request.Name != null) dealer.Name = request.Name;
            if (request.OwnerName != null) dealer.OwnerName = request.OwnerName;
            if (request.RegistrationNumber != null) dealer.RegistrationNumber = request.RegistrationNumber;
            if (request.GstNumber != null) dealer.GstNumber = request.GstNumber;
            if (request.Address != null) dealer.Address = request.Address;
            if (request.Phone != null) dealer.Phone = request.Phone;
            if (request.OpeningTime != null) dealer.OpeningTime = request.OpeningTime;
            if (request.ClosingTime != null) dealer.ClosingTime = request.ClosingTime;
            if (request.RentalEnabled != null) dealer.RentalEnabled = request.RentalEnabled;
            if (request.Role != null) dealer.Role = request.Role;
            if (request.GarageLogo != null) dealer.GarageLogo = request.GarageLogo;
            if (request.ServiceImages != null) dealer.ServiceImages = request.ServiceImages;
            if (request.RentalImages != null) dealer.RentalImages = request.RentalImages;

            dealer.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Dealers.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(dealer);
        }

        // PATCH: api/dealers/5/status (TOGGLE STATUS FUNCTIONALITY)
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateDealerStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null)
            {
                return NotFound();
            }

            dealer.Status = request.Status;
            dealer.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Dealers.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(dealer);
        }

        // DELETE: api/dealers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDealer(int id)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null)
            {
                return NotFound();
            }

            _context.Dealers.Remove(dealer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/dealers/upload-image
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                // Validate file extension
                var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!validExtensions.Contains(extension))
                {
                    return BadRequest("Invalid image file extension.");
                }

                // Generate unique filename to avoid conflicts
                var fileName = Guid.NewGuid().ToString() + extension;
                
                // Save to wwwroot/uploads/images
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "images");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                var filePath = Path.Combine(uploadsPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new { 
                    filename = fileName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, "Error uploading image.");
            }
        }

        // GET: api/dealers/images/{filename}
        [HttpGet("images/{filename}")]
        public IActionResult GetImage(string filename)
        {
            try
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "images", filename);
                if (!System.IO.File.Exists(imagePath))
                {
                    return NotFound();
                }

                var imageBytes = System.IO.File.ReadAllBytes(imagePath);
                return File(imageBytes, "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error serving image");
                return StatusCode(500, "Error serving image.");
            }
        }

        // Request DTOs
        public class CreateDealerRequest
        {
            public string Name { get; set; } = string.Empty;
            public string OwnerName { get; set; } = string.Empty;
            public string RegistrationNumber { get; set; } = string.Empty;
            public string GstNumber { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string OpeningTime { get; set; } = string.Empty;
            public string ClosingTime { get; set; } = string.Empty;
            public string RentalEnabled { get; set; } = string.Empty;
            public string Role { get; set; } = "Dealer";
            public string? GarageLogo { get; set; }
            public List<string>? ServiceImages { get; set; }
            public List<string>? RentalImages { get; set; }
        }

        public class UpdateDealerRequest
        {
            public string? Name { get; set; }
            public string? OwnerName { get; set; }
            public string? RegistrationNumber { get; set; }
            public string? GstNumber { get; set; }
            public string? Address { get; set; }
            public string? Phone { get; set; }
            public string? OpeningTime { get; set; }
            public string? ClosingTime { get; set; }
            public string? RentalEnabled { get; set; }
            public string? Role { get; set; }
            public string? GarageLogo { get; set; }
            public List<string>? ServiceImages { get; set; }
            public List<string>? RentalImages { get; set; }
        }

        public class StatusUpdateRequest
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
