using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class CreateBookServiceBookingsTableFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vehicle_Brand_Type",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Service_DealerId_Name",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_DealerServiceVehicle_Dealer_Service_Vehicle",
                table: "DealerServiceVehicles");

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Vehicles",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Services",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Active");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Services",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "DealerServiceVehicles",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldDefaultValue: 0m);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DealerServiceVehicles",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<int>(
                name: "ServiceId1",
                table: "DealerServiceVehicles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BookServiceBookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VehicleBrand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    VehicleType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookServiceBookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookServiceBookings_Dealers_DealerId",
                        column: x => x.DealerId,
                        principalTable: "Dealers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookServiceBookings_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookServiceBookings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookServiceBookings_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_DealerId",
                table: "Services",
                column: "DealerId");

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicles_DealerId",
                table: "DealerServiceVehicles",
                column: "DealerId");

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicles_ServiceId1",
                table: "DealerServiceVehicles",
                column: "ServiceId1");

            migrationBuilder.CreateIndex(
                name: "IX_BookServiceBookings_DealerId",
                table: "BookServiceBookings",
                column: "DealerId");

            migrationBuilder.CreateIndex(
                name: "IX_BookServiceBookings_ServiceId",
                table: "BookServiceBookings",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_BookServiceBookings_UserId",
                table: "BookServiceBookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BookServiceBookings_VehicleId",
                table: "BookServiceBookings",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId1",
                table: "DealerServiceVehicles",
                column: "ServiceId1",
                principalTable: "Services",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.DropTable(
                name: "BookServiceBookings");

            migrationBuilder.DropIndex(
                name: "IX_Services_DealerId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_DealerServiceVehicles_DealerId",
                table: "DealerServiceVehicles");

            migrationBuilder.DropIndex(
                name: "IX_DealerServiceVehicles_ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.DropColumn(
                name: "ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Vehicles",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Services",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Active",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Services",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "DealerServiceVehicles",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "DealerServiceVehicles",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

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
                name: "IX_Vehicle_Brand_Type",
                table: "Vehicles",
                columns: new[] { "Brand", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Service_DealerId_Name",
                table: "Services",
                columns: new[] { "DealerId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicle_Dealer_Service_Vehicle",
                table: "DealerServiceVehicles",
                columns: new[] { "DealerId", "ServiceId", "VehicleId" },
                unique: true);
        }
    }
}
