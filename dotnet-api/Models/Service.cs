using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace dotnet_api.Models
{
    public class Service
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string EstimatedTime { get; set; } = string.Empty;

        [Required]
        public bool RentalAllowed { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        public int DealerId { get; set; }

        [ForeignKey("DealerId")]
        [JsonIgnore]
        public Dealer? Dealer { get; set; }

        // Navigation property for related vehicle prices
        [JsonIgnore]
        public ICollection<DealerServiceVehicle> DealerServiceVehicles { get; set; } = new List<DealerServiceVehicle>();
    }
}
