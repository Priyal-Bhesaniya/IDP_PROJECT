using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;
using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/booking/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Verify user exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.MobileNumber == request.UserMobile);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                // Verify dealer exists
                var dealer = await _context.Dealers.FindAsync(request.DealerId);
                if (dealer == null)
                {
                    return BadRequest("Dealer not found");
                }

                // Verify service exists
                var service = await _context.Services.FindAsync(request.ServiceId);
                if (service == null)
                {
                    return BadRequest("Service not found");
                }

                // Verify vehicle exists
                var vehicle = await _context.Vehicles.FindAsync(request.VehicleId);
                if (vehicle == null)
                {
                    return BadRequest("Vehicle not found");
                }

                var booking = new Booking
                {
                    UserMobile = request.UserMobile,
                    DealerId = request.DealerId,
                    ServiceId = request.ServiceId,
                    VehicleId = request.VehicleId,
                    CarNumber = request.CarNumber,
                    CarModel = request.CarModel,
                    CarBrand = request.CarBrand,
                    CarYear = request.CarYear,
                    Price = request.Price,
                    PaymentStatus = "Completed", // Set to completed as requested
                    BookingStatus = "Pending",   // Set to pending for dealer approval
                    ServiceStatus = "pending",   // Default service status
                    PaymentMethod = request.PaymentMethod,
                    PaymentMethodType = request.PaymentMethodType,
                    TransactionId = GenerateTransactionId(),
                    CreatedAt = DateTime.UtcNow
                };

                // Store payment method specific details
                if (request.PaymentMethodType == "netbanking")
                {
                    booking.BankName = request.BankName;
                }

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // Load related data for response
                var createdBooking = await _context.Bookings
                    .Include(b => b.Dealer)
                    .Include(b => b.Service)
                    .Include(b => b.Vehicle)
                    .FirstOrDefaultAsync(b => b.Id == booking.Id);

                return Ok(new { 
                    message = "Booking created successfully", 
                    booking = createdBooking 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating booking", error = ex.Message });
            }
        }

        // GET: api/booking/user/{userMobile}
        [HttpGet("user/{userMobile}")]
        public async Task<IActionResult> GetUserBookings(string userMobile)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Where(b => b.UserMobile == userMobile)
                    .Include(b => b.Dealer)
                    .Include(b => b.Service)
                    .Include(b => b.Vehicle)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching bookings", error = ex.Message });
            }
        }

        // GET: api/booking/dealer/{dealerId}
        [HttpGet("dealer/{dealerId}")]
        public async Task<IActionResult> GetDealerBookings(int dealerId)
        {
            try
            {
                var bookings = await _context.Bookings
                    .Where(b => b.DealerId == dealerId)
                    .Include(b => b.Service)
                    .Include(b => b.Vehicle)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching bookings", error = ex.Message });
            }
        }

        // PUT: api/booking/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                booking.BookingStatus = request.Status;
                booking.DealerNotes = request.DealerNotes;
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Booking status updated successfully", booking });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating booking status", error = ex.Message });
            }
        }

        // PUT: api/booking/{id}/servicestatus
        [HttpPut("{id}/servicestatus")]
        public async Task<IActionResult> UpdateServiceStatus(int id, [FromBody] UpdateServiceStatusRequest request)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                booking.ServiceStatus = request.ServiceStatus;
                booking.DealerNotes = request.DealerNotes;
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Service status updated successfully", booking });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating service status", error = ex.Message });
            }
        }

        // GET: api/booking/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBooking(int id)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Dealer)
                    .Include(b => b.Service)
                    .Include(b => b.Vehicle)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                return Ok(booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching booking", error = ex.Message });
            }
        }

        private string GenerateTransactionId()
        {
            return $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
        }
    }

    // DTOs
    public class CreateBookingRequest
    {
        [Required]
        [StringLength(10)]
        public string UserMobile { get; set; } = string.Empty;

        [Required]
        public int DealerId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [Required]
        [StringLength(20)]
        public string CarNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string CarModel { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string CarBrand { get; set; } = string.Empty;

        [Required]
        public int CarYear { get; set; }

        [Required]
        public decimal Price { get; set; }

        [StringLength(50)]
        public string? PaymentMethod { get; set; }

        [StringLength(20)]
        public string? PaymentMethodType { get; set; }

        // Net Banking details
        [StringLength(100)]
        public string? BankName { get; set; }
    }

    public class UpdateStatusRequest
    {
        [Required]
        [StringLength(20)]
        public string Status { get; set; } = string.Empty;

        [StringLength(500)]
        public string? DealerNotes { get; set; }
    }

    public class UpdateServiceStatusRequest
    {
        [Required]
        [StringLength(20)]
        public string ServiceStatus { get; set; } = string.Empty;

        [StringLength(500)]
        public string? DealerNotes { get; set; }
    }
}
