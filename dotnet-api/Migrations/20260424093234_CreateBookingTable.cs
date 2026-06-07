using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class CreateBookingTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookServiceBookings");

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserMobile = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    CarNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CarModel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CarBrand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CarYear = table.Column<int>(type: "int", nullable: false),
                    CarColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AdditionalNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BookingStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DealerNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PaymentMethodType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CardName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CardLast4Digits = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UpiId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Dealers_DealerId",
                        column: x => x.DealerId,
                        principalTable: "Dealers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bookings_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_DealerId",
                table: "Bookings",
                column: "DealerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ServiceId",
                table: "Bookings",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_VehicleId",
                table: "Bookings",
                column: "VehicleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.CreateTable(
                name: "BookServiceBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdditionalNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CarBrand = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CarColor = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CarModel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CarNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CarYear = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    DealerNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PaymentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaymentStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "pending"),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    UserMobile = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    VehicleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookServiceBookings", x => x.Id);
                });
        }
    }
}
