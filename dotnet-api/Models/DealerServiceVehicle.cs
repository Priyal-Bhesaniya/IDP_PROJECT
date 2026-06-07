using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace dotnet_api.Models
{
    public class DealerServiceVehicle
    {
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; } = 0m;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [Required]
        public int DealerId { get; set; }

        [ForeignKey("DealerId")]
        [JsonIgnore]
        public Dealer? Dealer { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        [JsonIgnore]
        public Service? Service { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [ForeignKey("VehicleId")]
        [JsonIgnore]
        public Vehicle? Vehicle { get; set; }
    }
}
