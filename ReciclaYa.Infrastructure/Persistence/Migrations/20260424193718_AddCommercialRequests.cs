using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCommercialRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "commercial_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_commercial_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_commercial_requests_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_commercial_requests_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_commercial_requests_users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_commercial_requests_BuyerId",
                table: "commercial_requests",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_commercial_requests_CreatedAt",
                table: "commercial_requests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_commercial_requests_ListingId",
                table: "commercial_requests",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_commercial_requests_SellerId",
                table: "commercial_requests",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_commercial_requests_Status",
                table: "commercial_requests",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "commercial_requests");
        }
    }
}
