using System.ComponentModel.DataAnnotations;

namespace dotnet_api.Models
{
    public class RentalBooking
    {
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string CustomerMobile { get; set; } = string.Empty;

        [Required]
        public int CustomerId { get; set; }

        [Required]
        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public int DealerId { get; set; }

        [Required]
        [StringLength(100)]
        public string DealerName { get; set; } = string.Empty;

        [Required]
        public int ExecutiveCarId { get; set; }

        [Required]
        [StringLength(50)]
        public string CarCategory { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CarNumber { get; set; } = string.Empty;

        [Required]
        public int MinKm { get; set; }

        [Required]
        public int ExtraKm { get; set; }

        [Required]
        public int MaxKm { get; set; }

        [Required]
        [StringLength(20)]
        public string GearType { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        public int Seats { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal PricePerDay { get; set; }

        [Required]
        [Range(1, 365)]
        public int RentalDays { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal TotalAmount { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string PaymentMethodType { get; set; } = string.Empty;

        [StringLength(100)]
        public string? BankName { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentStatus { get; set; } = "Completed";

        [Required]
        [StringLength(20)]
        public string RentalStatus { get; set; } = "Pending";

        [Required]
        [StringLength(50)]
        public string FuelPolicy { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string InsurancePolicy { get; set; } = string.Empty;

        [Required]
        public bool AgreementAccepted { get; set; }

        [Required]
        [StringLength(200)]
        public string DigitalSignature { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string TransactionId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ExecutiveCar? ExecutiveCar { get; set; }
        public virtual Dealer? Dealer { get; set; }
    }
}
