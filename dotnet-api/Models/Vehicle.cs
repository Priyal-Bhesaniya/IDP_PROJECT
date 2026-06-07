using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace dotnet_api.Models
{
    public class Vehicle
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Type { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for related dealer service vehicles
        public ICollection<DealerServiceVehicle> DealerServiceVehicles { get; set; } = new List<DealerServiceVehicle>();
    }
}
