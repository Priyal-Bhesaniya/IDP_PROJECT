using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace dotnet_api.Models
{
    public class Dealer
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string OwnerName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string GstNumber { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Active";

        [Required]
        [StringLength(10)]
        public string OpeningTime { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string ClosingTime { get; set; } = string.Empty;

        [Required]
        [StringLength(10)]
        public string RentalEnabled { get; set; } = "no";

        [Required]
        public DateTime JoinedDate { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "Dealer";

        public string? GarageLogo { get; set; }

        public List<string>? ServiceImages { get; set; } = new List<string>();

        public List<string>? RentalImages { get; set; } = new List<string>();

        [NotMapped]
        public int Services => ServiceImages?.Count ?? 0;

        [NotMapped]
        public int Cars => RentalImages?.Count ?? 0;

        [NotMapped]
        public string ServiceCapacity { get; set; } = "Basic";

        [NotMapped]
        public string MaxRentalCars { get; set; } = "5";

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }

    // Custom ValueConverter for List<string> to handle empty strings and nulls
    public class StringListConverter : ValueConverter<List<string>?, string>
    {
        private static readonly ConverterMappingHints defaultHints = new();

        public StringListConverter() : base(
            v => ConvertToJson(v),
            v => ConvertFromJson(v),
            defaultHints)
        {
        }

        private static string ConvertToJson(List<string>? value)
        {
            if (value == null || !value.Any())
            {
                return "[]";
            }
            return System.Text.Json.JsonSerializer.Serialize(value);
        }

        private static List<string> ConvertFromJson(string value)
        {
            if (string.IsNullOrEmpty(value) || value == "[]")
            {
                return new List<string>();
            }

            try
            {
                var result = System.Text.Json.JsonSerializer.Deserialize<List<string>>(value);
                return result ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }
    }
}
