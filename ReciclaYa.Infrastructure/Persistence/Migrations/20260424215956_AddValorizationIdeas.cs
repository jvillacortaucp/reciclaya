using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddValorizationIdeas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "valorization_ideas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    SuggestedProduct = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ProcessOverview = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    PotentialBuyers = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    RequiredConditions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    SellerRecommendation = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    BuyerRecommendation = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    RecommendedStrategy = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ViabilityLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EstimatedImpact = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Warnings = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_valorization_ideas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_valorization_ideas_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_valorization_ideas_CreatedAt",
                table: "valorization_ideas",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_valorization_ideas_ListingId",
                table: "valorization_ideas",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_valorization_ideas_Source",
                table: "valorization_ideas",
                column: "Source");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "valorization_ideas");
        }
    }
}
