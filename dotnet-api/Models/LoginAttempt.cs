using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Models
{
    public class LoginAttempt
    {
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        public bool IsLocked { get; set; } = false;

        public DateTime? LockEndTime { get; set; }

        public int AttemptCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
