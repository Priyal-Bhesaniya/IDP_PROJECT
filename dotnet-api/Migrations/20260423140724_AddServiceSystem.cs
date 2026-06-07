using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EstimatedTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RentalAllowed = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DealerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_Dealers_DealerId",
                        column: x => x.DealerId,
                        principalTable: "Dealers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DealerServiceVehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false, defaultValue: 0m),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DealerServiceVehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DealerServiceVehicles_Dealers_DealerId",
                        column: x => x.DealerId,
                        principalTable: "Dealers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DealerServiceVehicles_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DealerServiceVehicles_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "Id", "Brand", "CreatedAt", "Type" },
                values: new object[,]
                {
                    { 1, "Maruti", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2648), "Simple Car" },
                    { 2, "Maruti", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2651), "Luxury Car" },
                    { 3, "Honda", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2653), "Simple Car" },
                    { 4, "Honda", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2654), "Luxury Car" },
                    { 5, "Toyota", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2656), "Simple Car" },
                    { 6, "Toyota", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2658), "Luxury Car" },
                    { 7, "Hyundai", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2659), "Simple Car" },
                    { 8, "Hyundai", new DateTime(2026, 4, 23, 14, 7, 24, 502, DateTimeKind.Utc).AddTicks(2662), "Luxury Car" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicle_Dealer_Service_Vehicle",
                table: "DealerServiceVehicles",
                columns: new[] { "DealerId", "ServiceId", "VehicleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicles_ServiceId",
                table: "DealerServiceVehicles",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicles_VehicleId",
                table: "DealerServiceVehicles",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Service_DealerId_Name",
                table: "Services",
                columns: new[] { "DealerId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicle_Brand_Type",
                table: "Vehicles",
                columns: new[] { "Brand", "Type" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DealerServiceVehicles");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropTable(
                name: "Vehicles");
        }
    }
}
