using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Collections.Concurrent;
using dotnet_api.Data;
using dotnet_api.Models;

namespace dotnet_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext _context;
        
        // In-memory cache for performance
        private static ConcurrentDictionary<string, OTPData> _otpCache = new();
        private static ConcurrentDictionary<string, LoginAttemptData> _attemptCache = new();

        public AuthController(ILogger<AuthController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOTP([FromBody] SendOTPRequestDto request)
        {
            try
            {
                // Validate mobile number
                if (!IsValidMobileNumber(request.MobileNumber))
                {
                    return BadRequest(new { success = false, message = "Invalid mobile number format" });
                }

                // Check if User is locked
                var isLocked = await IsUserLocked(request.MobileNumber);
                
                // If User was locked but lock has expired, reset attempts
                if (!isLocked)
                {
                    await ResetAttemptCount(request.MobileNumber);
                }
                
                if (isLocked)
                {
                    return BadRequest(new { success = false, message = "Account is temporarily locked. Please try again later." });
                }

                // Generate OTP
                var otp = GenerateOTP();
                var expiryTime = DateTime.Now.AddMinutes(5);

                // Save to database
                await SaveOTPToDatabase(request.MobileNumber, request.Name, otp, expiryTime);
                
                // Cache for performance
                _otpCache[request.MobileNumber] = new OTPData
                {
                    OTP = otp,
                    ExpiryTime = expiryTime,
                    IsUsed = false
                };

                _logger.LogInformation($"OTP sent to {request.MobileNumber}: {otp}");

                return Ok(new { success = true, message = "OTP sent successfully", demoOTP = otp });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequestDto request)
        {
            try
            {
                // Validate mobile number
                if (!IsValidMobileNumber(request.MobileNumber))
                {
                    return BadRequest(new { success = false, message = "Invalid mobile number format" });
                }

                // Check if User is locked
                if (await IsUserLocked(request.MobileNumber))
                {
                    return BadRequest(new { success = false, message = "Account is temporarily locked. Please try again later." });
                }

                // Check OTP in database
                var isValidOTP = await VerifyOTPInDatabase(request.MobileNumber, request.OTP);

                if (!isValidOTP)
                {
                    // Get current attempt count before incrementing
                    var currentAttempts = await GetCurrentAttemptCount(request.MobileNumber);
                    
                    // Check user role for debugging
                    var (debugRole, debugName, debugDealerId) = await GetUserRoleAndName(request.MobileNumber);
                    _logger.LogInformation($"OTP verification failed for {request.MobileNumber}. Role: {debugRole}, Name: {debugName}, Current attempts: {currentAttempts}");
                    
                    // Check if this will be the 3rd attempt (should lock)
                    if (currentAttempts >= 2)
                    {
                        // This is the 3rd attempt - lock account immediately
                        _logger.LogInformation($"This is the 3rd attempt - locking account for {request.MobileNumber} (Role: {debugRole})");
                        await IncrementAttemptCount(request.MobileNumber);
                        await LockAccountInDatabase(request.MobileNumber);
                        return BadRequest(new { success = false, message = "Account locked due to too many failed attempts. Please try again after 1 minute." });
                    }
                    else
                    {
                        // Increment attempt count and show remaining attempts
                        var attempts = await IncrementAttemptCount(request.MobileNumber);
                        var remaining = 3 - attempts;
                        _logger.LogInformation($"After increment - attempts: {attempts}, remaining: {remaining} for {request.MobileNumber} (Role: {debugRole})");
                        return BadRequest(new { success = false, message = $"Invalid OTP. {remaining} attempts remaining." });
                    }
                }

                // Mark OTP as used
                await MarkOTPAsUsed(request.MobileNumber, request.OTP);

                // Reset attempt count
                await ResetAttemptCount(request.MobileNumber);

                _logger.LogInformation($"OTP verified successfully for {request.MobileNumber}");

                // Get user role, name, and dealer ID
                var (userRole, userName, dealerId) = await GetUserRoleAndName(request.MobileNumber);
                
                _logger.LogInformation($"Login result - Mobile: {request.MobileNumber}, Role: {userRole}, Name: {userName}, DealerId: {dealerId}");
                
                return Ok(new { 
                    success = true, 
                    message = "Login successful!",
                    token = GenerateToken(request.MobileNumber),
                    role = userRole,
                    name = userName,
                    mobileNumber = request.MobileNumber,
                    dealerId = dealerId,
                    databaseConnection = "Connected to DESKTOP-ALT95HP\\SQLEXPRESS"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying OTP");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOTP([FromBody] SendOTPRequestDto request)
        {
            try
            {
                // Validate mobile number
                if (!IsValidMobileNumber(request.MobileNumber))
                {
                    return BadRequest(new { success = false, message = "Invalid mobile number format" });
                }

                // Check if User is locked
                var isLocked = await IsUserLocked(request.MobileNumber);
                
                // If User was locked but lock has expired, reset attempts
                if (!isLocked)
                {
                    await ResetAttemptCount(request.MobileNumber);
                }
                
                if (isLocked)
                {
                    return BadRequest(new { success = false, message = "Account is temporarily locked. Please try again later." });
                }

                // Generate new OTP
                var otp = GenerateOTP();
                var expiryTime = DateTime.Now.AddMinutes(5);

                // Save to database
                await SaveOTPToDatabase(request.MobileNumber, request.Name, otp, expiryTime);

                // Update cache
                _otpCache[request.MobileNumber] = new OTPData
                {
                    OTP = otp,
                    ExpiryTime = expiryTime,
                    IsUsed = false
                };

                _logger.LogInformation($"OTP resent to {request.MobileNumber}: {otp}");

                return Ok(new { success = true, message = "OTP resent successfully", demoOTP = otp });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resending OTP");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        // Helper methods
        private bool IsValidMobileNumber(string mobileNumber)
        {
            return Regex.IsMatch(mobileNumber, @"^[6-9]\d{9,10}$");
        }

        private string GenerateOTP()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString("D6");
        }

        private string GenerateToken(string mobileNumber)
        {
            return $"token_{mobileNumber}_{DateTime.Now:yyyyMMddHHmmss}";
        }

        private async Task<bool> IsUserLocked(string mobileNumber)
        {
            try
            {
                var lockAttempt = await _context.LoginAttempts
                    .Where(l => l.MobileNumber == mobileNumber && l.IsLocked && l.LockEndTime > DateTime.Now)
                    .FirstOrDefaultAsync();
                
                return lockAttempt != null;
            }
            catch
            {
                return false;
            }
        }

        private async Task SaveOTPToDatabase(string mobileNumber, string name, string otp, DateTime expiryTime)
        {
            try
            {
                // Invalidate previous OTPs
                var previousOTPs = await _context.OTPRequests
                    .Where(o => o.MobileNumber == mobileNumber && !o.IsUsed)
                    .ToListAsync();
                
                foreach (var prevOtp in previousOTPs)
                {
                    prevOtp.IsUsed = true;
                }
                
                // Insert new OTP
                var otpRequest = new OTPRequest
                {
                    MobileNumber = mobileNumber,
                    OTP = otp,
                    ExpiryTime = expiryTime,
                    IsUsed = false
                };
                
                _context.OTPRequests.Add(otpRequest);
                
                // Ensure user exists with their entered name
                var existingUser = await _context.Users
                    .Where(u => u.MobileNumber == mobileNumber)
                    .FirstOrDefaultAsync();
                
                if (existingUser == null)
                {
                    // Create new user
                    var newUser = new User
                    {
                        MobileNumber = mobileNumber,
                        Role = "USER",
                        IsActive = true,
                        Name = name,
                        CreatedAt = DateTime.Now
                    };
                    _context.Users.Add(newUser);
                }
                else
                {
                    // Update existing user name if it's "New User"
                    if (existingUser.Name == "New User")
                    {
                        existingUser.Name = name;
                    }
                }
                
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving OTP to database");
                throw;
            }
        }

        private async Task<bool> VerifyOTPInDatabase(string mobileNumber, string? otp)
        {
            try
            {
                var validOTP = await _context.OTPRequests
                    .Where(o => o.MobileNumber == mobileNumber && o.OTP == otp && !o.IsUsed && o.ExpiryTime > DateTime.Now)
                    .FirstOrDefaultAsync();
                
                return validOTP != null;
            }
            catch
            {
                return false;
            }
        }

        private async Task MarkOTPAsUsed(string mobileNumber, string? otp)
        {
            try
            {
                var otpRequest = await _context.OTPRequests
                    .Where(o => o.MobileNumber == mobileNumber && o.OTP == otp && !o.IsUsed)
                    .FirstOrDefaultAsync();
                
                if (otpRequest != null)
                {
                    otpRequest.IsUsed = true;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking OTP as used");
            }
        }

        private async Task ResetAttemptCount(string mobileNumber)
        {
            try
            {
                var attempts = await _context.LoginAttempts
                    .Where(l => l.MobileNumber == mobileNumber)
                    .ToListAsync();
                
                foreach (var attempt in attempts)
                {
                    attempt.AttemptCount = 0;
                    attempt.IsLocked = false;
                    attempt.LockEndTime = null;
                }
                
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting attempt count");
            }
        }

        private async Task<int> GetCurrentAttemptCount(string mobileNumber)
        {
            try
            {
                var attempt = await _context.LoginAttempts
                    .Where(l => l.MobileNumber == mobileNumber)
                    .FirstOrDefaultAsync();
                
                return attempt?.AttemptCount ?? 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current attempt count");
                return 0;
            }
        }

        private async Task<int> IncrementAttemptCount(string mobileNumber)
        {
            try
            {
                var attempt = await _context.LoginAttempts
                    .Where(l => l.MobileNumber == mobileNumber)
                    .FirstOrDefaultAsync();
                
                if (attempt != null)
                {
                    attempt.AttemptCount++;
                    
                    // Lock account after 3 failed Attempts
                    if (attempt.AttemptCount >= 3)
                    {
                        attempt.IsLocked = true;
                        attempt.LockEndTime = DateTime.Now.AddMinutes(1);
                    }
                    
                    await _context.SaveChangesAsync();
                    return attempt.AttemptCount;
                }
                else
                {
                    // Create new login attempt record
                    var newAttempt = new LoginAttempt
                    {
                        MobileNumber = mobileNumber,
                        AttemptCount = 1,
                        IsLocked = false,
                        LockEndTime = null,
                        CreatedAt = DateTime.Now
                    };
                    
                    _context.LoginAttempts.Add(newAttempt);
                    await _context.SaveChangesAsync();
                    return 1;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing attempt count");
                return 0;
            }
        }

        private async Task LockAccountInDatabase(string mobileNumber)
        {
            try
            {
                var attempt = await _context.LoginAttempts
                    .Where(l => l.MobileNumber == mobileNumber)
                    .FirstOrDefaultAsync();
                
                if (attempt != null)
                {
                    attempt.IsLocked = true;
                    attempt.LockEndTime = DateTime.Now.AddMinutes(1);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error locking account");
            }
        }

        private async Task<(string role, string name, int? dealerId)> GetUserRoleAndName(string mobileNumber)
        {
            try
            {
                _logger.LogInformation($"Getting role and name for mobile: {mobileNumber}");
                
                // First check Dealers table (priority for dealer authentication)
                var dealer = await _context.Dealers
                    .Where(d => d.Phone == mobileNumber)
                    .FirstOrDefaultAsync();
                
                if (dealer != null)
                {
                    _logger.LogInformation($"Found dealer in Dealers table: Name={dealer.Name}, Phone={dealer.Phone}, Status={dealer.Status}, Role={dealer.Role}");
                    
                    // Check if dealer has valid role and status
                    if (dealer.Role.ToLower() == "dealer" && dealer.Status.ToLower() == "active")
                    {
                        _logger.LogInformation($"Dealer {dealer.Name} has valid role and status, returning DEALER role");
                        return ("DEALER", dealer.Name, dealer.Id);
                    }
                    else
                    {
                        _logger.LogWarning($"Dealer {dealer.Name} has invalid role ({dealer.Role}) or status ({dealer.Status}), returning USER role");
                        return ("USER", dealer.Name, dealer.Id);
                    }
                }
                
                _logger.LogInformation($"No dealer found in Dealers table for mobile: {mobileNumber}, checking Users table");
                
                // If not found in Dealers table, check Users table
                var user = await _context.Users
                    .Where(u => u.MobileNumber == mobileNumber && u.IsActive)
                    .FirstOrDefaultAsync();
                
                if (user != null)
                {
                    _logger.LogInformation($"Found user in Users table: Mobile={user.MobileNumber}, Role={user.Role}, Name={user.Name}, IsActive={user.IsActive}");
                    
                    _logger.LogInformation($"Returning user role: {user.Role}, name: {user.Name}");
                    return (user.Role, user.Name, null);
                }
                
                _logger.LogInformation($"No user or dealer found for mobile: {mobileNumber}, returning USER role");
                return ("USER", "User", null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user role and name");
                return ("USER", "User", null);
            }
        }
    }

    // DTOs
    public class SendOTPRequestDto
    {
        public string MobileNumber { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class VerifyOTPRequestDto
    {
        public string MobileNumber { get; set; } = string.Empty;
        public string? OTP { get; set; } = null;
    }

    public class OTPData
    {
        public string? OTP { get; set; }
        public DateTime ExpiryTime { get; set; }
        public bool IsUsed { get; set; } = false;
    }

    public class LoginAttemptData
    {
        public int AttemptCount { get; set; }
        public bool IsLocked { get; set; }
        public DateTime LockEndTime { get; set; }
    }
}
