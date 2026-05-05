using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixRecommendationAnalysesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "recommendation_analyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedProductId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Source = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    PayloadJson = table.Column<string>(type: "text", nullable: false),
                    CoveragePercent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    ProcessOk = table.Column<bool>(type: "boolean", nullable: false),
                    ExplanationOk = table.Column<bool>(type: "boolean", nullable: false),
                    MarketOk = table.Column<bool>(type: "boolean", nullable: false),
                    ErrorCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recommendation_analyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recommendation_analyses_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_CreatedAt",
                table: "recommendation_analyses",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_ListingId_SelectedProductId_Created~",
                table: "recommendation_analyses",
                columns: new[] { "ListingId", "SelectedProductId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_Source",
                table: "recommendation_analyses",
                column: "Source");

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_Status",
                table: "recommendation_analyses",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recommendation_analyses");
        }
    }
}
