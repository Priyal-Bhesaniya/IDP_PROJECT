using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnetapi.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleColumnToExistingDealers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Dealers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Dealer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Dealers");
        }
    }
}
