using Microsoft.EntityFrameworkCore;
using dotnet_api.Models;

namespace dotnet_api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Dealer> Dealers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<OTPRequest> OTPRequests { get; set; }
        public DbSet<LoginAttempt> LoginAttempts { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<DealerServiceVehicle> DealerServiceVehicles { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<ExecutiveCar> ExecutiveCars { get; set; }
        public DbSet<RentalBooking> RentalBookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure ValueConverter for List<string> properties
            modelBuilder.Entity<Dealer>()
                .Property(d => d.ServiceImages)
                .HasConversion<StringListConverter>();
            
            modelBuilder.Entity<Dealer>()
                .Property(d => d.RentalImages)
                .HasConversion<StringListConverter>();

            // Configure Booking relationships without cascade delete to avoid multiple cascade paths
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Dealer)
                .WithMany()
                .HasForeignKey(b => b.DealerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Service)
                .WithMany()
                .HasForeignKey(b => b.ServiceId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Vehicle)
                .WithMany()
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure RentalBooking relationships
            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.Dealer)
                .WithMany()
                .HasForeignKey(rb => rb.DealerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RentalBooking>()
                .HasOne(rb => rb.ExecutiveCar)
                .WithMany()
                .HasForeignKey(rb => rb.ExecutiveCarId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
