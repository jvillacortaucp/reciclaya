using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRegulationLevelCatalogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "regulation_level_catalogs",
                columns: table => new
                {
                    Level = table.Column<int>(type: "integer", nullable: false),
                    PayloadJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_level_catalogs", x => x.Level);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "regulation_level_catalogs");
        }
    }
}
