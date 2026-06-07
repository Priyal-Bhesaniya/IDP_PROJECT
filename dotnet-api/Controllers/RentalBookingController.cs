using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using dotnet_api.Models;
using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RentalBookingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RentalBookingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/rentalbooking
        [HttpPost]
        public async Task<ActionResult<RentalBooking>> CreateRentalBooking([FromBody] RentalBooking booking)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(booking.CustomerMobile) ||
                    string.IsNullOrEmpty(booking.CustomerName) ||
                    booking.DealerId <= 0 ||
                    booking.ExecutiveCarId <= 0 ||
                    string.IsNullOrEmpty(booking.PaymentMethod))
                {
                    return BadRequest("Missing required fields");
                }

                // Check if executive car exists
                var executiveCar = await _context.ExecutiveCars.FindAsync(booking.ExecutiveCarId);
                if (executiveCar == null)
                {
                    return BadRequest("Executive car not found");
                }

                // Check if dealer exists
                var dealer = await _context.Dealers.FindAsync(booking.DealerId);
                if (dealer == null)
                {
                    return BadRequest("Dealer not found");
                }

                // Set default values
                booking.CreatedAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;
                booking.PaymentStatus = "Completed";
                booking.RentalStatus = "Pending";

                // Generate transaction ID if not provided
                if (string.IsNullOrEmpty(booking.TransactionId))
                {
                    booking.TransactionId = $"TXN{DateTime.Now:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
                }

                // Update executive car status to 'booked'
                executiveCar.Status = "booked";
                executiveCar.UpdatedAt = DateTime.UtcNow;

                _context.RentalBookings.Add(booking);
                await _context.SaveChangesAsync();

                // Load related data for response
                var createdBooking = await _context.RentalBookings
                    .Include(rb => rb.ExecutiveCar)
                    .Include(rb => rb.Dealer)
                    .FirstOrDefaultAsync(rb => rb.Id == booking.Id);

                return CreatedAtAction(nameof(GetRentalBooking), new { id = booking.Id }, createdBooking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/rentalbooking/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RentalBooking>> GetRentalBooking(int id)
        {
            try
            {
                var booking = await _context.RentalBookings
                    .Include(rb => rb.ExecutiveCar)
                    .Include(rb => rb.Dealer)
                    .FirstOrDefaultAsync(rb => rb.Id == id);

                if (booking == null)
                {
                    return NotFound("Rental booking not found");
                }

                return booking;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/rentalbooking/customer/{mobileNumber}
        [HttpGet("customer/{mobileNumber}")]
        public async Task<ActionResult<IEnumerable<RentalBooking>>> GetRentalBookingsByCustomer(string mobileNumber)
        {
            try
            {
                var bookings = await _context.RentalBookings
                    .Where(rb => rb.CustomerMobile == mobileNumber)
                    .Include(rb => rb.ExecutiveCar)
                    .Include(rb => rb.Dealer)
                    .OrderByDescending(rb => rb.CreatedAt)
                    .ToListAsync();

                return bookings;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/rentalbooking/dealer/{dealerId}
        [HttpGet("dealer/{dealerId}")]
        public async Task<ActionResult<IEnumerable<RentalBooking>>> GetRentalBookingsByDealer(int dealerId)
        {
            try
            {
                var bookings = await _context.RentalBookings
                    .Where(rb => rb.DealerId == dealerId)
                    .Include(rb => rb.ExecutiveCar)
                    .Include(rb => rb.Dealer)
                    .OrderByDescending(rb => rb.CreatedAt)
                    .ToListAsync();

                return bookings;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/rentalbooking/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<RentalBooking>> UpdateRentalBookingStatus(int id, [FromBody] string status)
        {
            try
            {
                var booking = await _context.RentalBookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound("Rental booking not found");
                }

                booking.RentalStatus = status;
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Load related data for response
                var updatedBooking = await _context.RentalBookings
                    .Include(rb => rb.ExecutiveCar)
                    .Include(rb => rb.Dealer)
                    .FirstOrDefaultAsync(rb => rb.Id == id);

                return updatedBooking;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/rentalbooking/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRentalBooking(int id)
        {
            try
            {
                var booking = await _context.RentalBookings.FindAsync(id);
                if (booking == null)
                {
                    return NotFound("Rental booking not found");
                }

                _context.RentalBookings.Remove(booking);
                await _context.SaveChangesAsync();

                return Ok("Rental booking deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
