using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_api.Models
{
    public class ExecutiveCar
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DealerId { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CarNumber { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal MinKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal ExtraKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MaxKm { get; set; }

        [Required]
        [StringLength(50)]
        public string GearType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        public int Seats { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerDay { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int? CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }

        // Navigation property
        [ForeignKey("DealerId")]
        public virtual Dealer? Dealer { get; set; }
    }

    // DTO for creating ExecutiveCar
    public class CreateExecutiveCarDto
    {
        [Required]
        public int DealerId { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CarNumber { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal MinKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal ExtraKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MaxKm { get; set; }

        [Required]
        [StringLength(50)]
        public string GearType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        public int Seats { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerDay { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }

    // DTO for updating ExecutiveCar
    public class UpdateExecutiveCarDto
    {
        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CarNumber { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal MinKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal ExtraKm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MaxKm { get; set; }

        [Required]
        [StringLength(50)]
        public string GearType { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FuelType { get; set; } = string.Empty;

        [Required]
        public int Seats { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PricePerDay { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "active";
    }
}
