using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddListingsBase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferenceCode = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    WasteType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Sector = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ProductType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SpecificResidue = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    GenerationFrequency = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    PricePerUnitUsd = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    MaxStorageTime = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    ExchangeType = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    DeliveryMode = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ImmediateAvailability = table.Column<bool>(type: "boolean", nullable: false),
                    Condition = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Restrictions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    NextAvailabilityDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MatchScore = table.Column<int>(type: "integer", nullable: true),
                    AiSuggestionNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DraftSavedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_listings_users_SellerId",
                        column: x => x.SellerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "listing_media",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Alt = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    SizeKb = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Type = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listing_media", x => x.Id);
                    table.ForeignKey(
                        name: "FK_listing_media_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "listing_technical_specs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Label = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_listing_technical_specs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_listing_technical_specs_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_listing_media_ListingId",
                table: "listing_media",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_listing_media_ListingId_SortOrder",
                table: "listing_media",
                columns: new[] { "ListingId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_listing_technical_specs_ListingId",
                table: "listing_technical_specs",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_listing_technical_specs_ListingId_Key",
                table: "listing_technical_specs",
                columns: new[] { "ListingId", "Key" });

            migrationBuilder.CreateIndex(
                name: "IX_listings_CreatedAt",
                table: "listings",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_listings_ExchangeType",
                table: "listings",
                column: "ExchangeType");

            migrationBuilder.CreateIndex(
                name: "IX_listings_Location",
                table: "listings",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_listings_ProductType",
                table: "listings",
                column: "ProductType");

            migrationBuilder.CreateIndex(
                name: "IX_listings_ReferenceCode",
                table: "listings",
                column: "ReferenceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_listings_Sector",
                table: "listings",
                column: "Sector");

            migrationBuilder.CreateIndex(
                name: "IX_listings_SellerId",
                table: "listings",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_listings_Status",
                table: "listings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_listings_WasteType",
                table: "listings",
                column: "WasteType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "listing_media");

            migrationBuilder.DropTable(
                name: "listing_technical_specs");

            migrationBuilder.DropTable(
                name: "listings");
        }
    }
}
