using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_api.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string UserMobile { get; set; } = string.Empty;

        [Required]
        public int DealerId { get; set; }

        [ForeignKey("DealerId")]
        public Dealer? Dealer { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [ForeignKey("VehicleId")]
        public Vehicle? Vehicle { get; set; }

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
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentStatus { get; set; } = "Completed";

        [Required]
        [StringLength(20)]
        public string BookingStatus { get; set; } = "Pending";

        [Required]
        [StringLength(20)]
        public string ServiceStatus { get; set; } = "pending";

        [StringLength(50)]
        public string? PaymentMethod { get; set; }

        [StringLength(20)]
        public string? PaymentMethodType { get; set; } // card, upi, netbanking

        [StringLength(100)]
        public string? TransactionId { get; set; }

        [StringLength(100)]
        public string? BankName { get; set; }

        [StringLength(500)]
        public string? DealerNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
