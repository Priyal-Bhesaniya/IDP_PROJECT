using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Models
{
    public class OTPRequest
    {
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string OTP { get; set; } = string.Empty;

        public DateTime ExpiryTime { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
