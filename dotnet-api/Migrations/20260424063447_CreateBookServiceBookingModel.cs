using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class CreateBookServiceBookingModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Dealers_DealerId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Services_ServiceId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Users_UserId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Vehicles_VehicleId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId",
                table: "DealerServiceVehicles");

            migrationBuilder.DropForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.DropIndex(
                name: "IX_DealerServiceVehicles_ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.DropColumn(
                name: "ServiceId1",
                table: "DealerServiceVehicles");

            migrationBuilder.AddColumn<string>(
                name: "PaymentId",
                table: "BookServiceBookings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Dealers_DealerId",
                table: "BookServiceBookings",
                column: "DealerId",
                principalTable: "Dealers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Services_ServiceId",
                table: "BookServiceBookings",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Users_UserId",
                table: "BookServiceBookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Vehicles_VehicleId",
                table: "BookServiceBookings",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId",
                table: "DealerServiceVehicles",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Dealers_DealerId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Services_ServiceId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Users_UserId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_BookServiceBookings_Vehicles_VehicleId",
                table: "BookServiceBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId",
                table: "DealerServiceVehicles");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "BookServiceBookings");

            migrationBuilder.AddColumn<int>(
                name: "ServiceId1",
                table: "DealerServiceVehicles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DealerServiceVehicles_ServiceId1",
                table: "DealerServiceVehicles",
                column: "ServiceId1");

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Dealers_DealerId",
                table: "BookServiceBookings",
                column: "DealerId",
                principalTable: "Dealers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Services_ServiceId",
                table: "BookServiceBookings",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Users_UserId",
                table: "BookServiceBookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BookServiceBookings_Vehicles_VehicleId",
                table: "BookServiceBookings",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId",
                table: "DealerServiceVehicles",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DealerServiceVehicles_Services_ServiceId1",
                table: "DealerServiceVehicles",
                column: "ServiceId1",
                principalTable: "Services",
                principalColumn: "Id");
        }
    }
}
