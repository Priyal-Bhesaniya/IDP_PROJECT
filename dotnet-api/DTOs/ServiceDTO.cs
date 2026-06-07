using System.ComponentModel.DataAnnotations;

namespace dotnet_api.DTOs
{
    public class ServiceDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty;
        public bool RentalAllowed { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int DealerId { get; set; }
        public List<DealerServiceVehicleDTO>? DealerServiceVehicles { get; set; }
    }

    public class DealerServiceVehicleDTO
    {
        public int Id { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int DealerId { get; set; }
        public int ServiceId { get; set; }
        public int VehicleId { get; set; }
        public VehicleDTO? Vehicle { get; set; }
    }

    public class VehicleDTO
    {
        public int Id { get; set; }
        public string Brand { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateServiceRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string EstimatedTime { get; set; } = string.Empty;
        
        public bool RentalAllowed { get; set; }
        
        public int DealerId { get; set; }
        
        public List<VehiclePriceRequest>? VehiclePrices { get; set; }
    }

    public class UpdateServiceRequest
    {
        public string? Name { get; set; }
        public string? EstimatedTime { get; set; }
        public bool? RentalAllowed { get; set; }
        public string? Status { get; set; }
        public List<VehiclePriceRequest>? VehiclePrices { get; set; }
    }

    public class VehiclePriceRequest
    {
        public int VehicleId { get; set; }
        public decimal Price { get; set; }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
