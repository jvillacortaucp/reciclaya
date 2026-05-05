using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChatbotRecommendationAnalysisMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "ListingId",
                table: "recommendation_analyses",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "AnalysisOrigin",
                table: "recommendation_analyses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "listing");

            migrationBuilder.AddColumn<string>(
                name: "ChatbotProductId",
                table: "recommendation_analyses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChatbotProductName",
                table: "recommendation_analyses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChatbotResidueInput",
                table: "recommendation_analyses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChatbotSectorName",
                table: "recommendation_analyses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "recommendation_analyses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_AnalysisOrigin",
                table: "recommendation_analyses",
                column: "AnalysisOrigin");

            migrationBuilder.CreateIndex(
                name: "IX_recommendation_analyses_UserId_AnalysisOrigin_ChatbotProduc~",
                table: "recommendation_analyses",
                columns: new[] { "UserId", "AnalysisOrigin", "ChatbotProductId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_recommendation_analyses_AnalysisOrigin",
                table: "recommendation_analyses");

            migrationBuilder.DropIndex(
                name: "IX_recommendation_analyses_UserId_AnalysisOrigin_ChatbotProduc~",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "AnalysisOrigin",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "ChatbotProductId",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "ChatbotProductName",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "ChatbotResidueInput",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "ChatbotSectorName",
                table: "recommendation_analyses");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "recommendation_analyses");

            migrationBuilder.AlterColumn<Guid>(
                name: "ListingId",
                table: "recommendation_analyses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
