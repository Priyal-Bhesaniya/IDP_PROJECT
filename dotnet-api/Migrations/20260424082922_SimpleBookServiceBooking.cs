using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class SimpleBookServiceBooking : Migration
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

            migrationBuilder.DropIndex(
                name: "IX_BookServiceBookings_DealerId",
                table: "BookServiceBookings");

            migrationBuilder.DropIndex(
                name: "IX_BookServiceBookings_ServiceId",
                table: "BookServiceBookings");

            migrationBuilder.DropIndex(
                name: "IX_BookServiceBookings_UserId",
                table: "BookServiceBookings");

            migrationBuilder.DropIndex(
                name: "IX_BookServiceBookings_VehicleId",
                table: "BookServiceBookings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
