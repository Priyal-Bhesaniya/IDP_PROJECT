using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class CreateSimpleBookServiceBookingTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedDate",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "ServiceName",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "VehicleBrand",
                table: "BookServiceBookings");

            migrationBuilder.RenameColumn(
                name: "VehicleType",
                table: "BookServiceBookings",
                newName: "CarModel");

            migrationBuilder.RenameColumn(
                name: "TotalPrice",
                table: "BookServiceBookings",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "BookServiceBookings",
                newName: "DealerNotes");

            migrationBuilder.RenameColumn(
                name: "CompletedDate",
                table: "BookServiceBookings",
                newName: "UpdatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "BookServiceBookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "PaymentId",
                table: "BookServiceBookings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingDate",
                table: "BookServiceBookings",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalNotes",
                table: "BookServiceBookings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarBrand",
                table: "BookServiceBookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CarColor",
                table: "BookServiceBookings",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarNumber",
                table: "BookServiceBookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CarYear",
                table: "BookServiceBookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "BookServiceBookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "BookServiceBookings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserMobile",
                table: "BookServiceBookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalNotes",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "CarBrand",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "CarColor",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "CarNumber",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "CarYear",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "BookServiceBookings");

            migrationBuilder.DropColumn(
                name: "UserMobile",
                table: "BookServiceBookings");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "BookServiceBookings",
                newName: "CompletedDate");

            migrationBuilder.RenameColumn(
                name: "Price",
                table: "BookServiceBookings",
                newName: "TotalPrice");

            migrationBuilder.RenameColumn(
                name: "DealerNotes",
                table: "BookServiceBookings",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "CarModel",
                table: "BookServiceBookings",
                newName: "VehicleType");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "BookServiceBookings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "PaymentId",
                table: "BookServiceBookings",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "BookingDate",
                table: "BookServiceBookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedDate",
                table: "BookServiceBookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceName",
                table: "BookServiceBookings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VehicleBrand",
                table: "BookServiceBookings",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
