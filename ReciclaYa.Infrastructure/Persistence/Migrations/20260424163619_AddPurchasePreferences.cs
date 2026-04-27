using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchasePreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "purchase_preferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResidueType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Sector = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ProductType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SpecificResidue = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    RequiredVolume = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PurchaseFrequency = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    MinPriceUsd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxPriceUsd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DesiredCondition = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ReceivingLocation = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    RadiusKm = table.Column<int>(type: "integer", nullable: false),
                    PreferredMode = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    AcceptedExchangeType = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AlertOnMatch = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ProfileStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DraftSavedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_preferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_preferences_users_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_preferences_BuyerId",
                table: "purchase_preferences",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_preferences_ProductType",
                table: "purchase_preferences",
                column: "ProductType");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_preferences_ProfileStatus",
                table: "purchase_preferences",
                column: "ProfileStatus");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_preferences_ResidueType",
                table: "purchase_preferences",
                column: "ResidueType");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_preferences_Sector",
                table: "purchase_preferences",
                column: "Sector");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "purchase_preferences");
        }
    }
}
