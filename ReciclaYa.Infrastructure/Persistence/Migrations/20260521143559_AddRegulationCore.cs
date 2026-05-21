using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRegulationCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "regulation_operation_audits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Actor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Action = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Allowed = table.Column<bool>(type: "boolean", nullable: false),
                    RequiredMinLevel = table.Column<int>(type: "integer", nullable: false),
                    ActorCurrentLevel = table.Column<int>(type: "integer", nullable: false),
                    BlockingReasonCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    ContextResidueType = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ContextSector = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ContextProductType = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    ContextSpecificResidue = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ContextQuantity = table.Column<decimal>(type: "numeric", nullable: true),
                    ContextUnit = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ManualReviewRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_operation_audits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_regulation_operation_audits_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_regulation_profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_regulation_profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_regulation_profiles_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_regulation_requirements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    RequirementCode = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EvidenceUrl = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_regulation_requirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_regulation_requirements_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_operation_audits_Action_CreatedAt",
                table: "regulation_operation_audits",
                columns: new[] { "Action", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_operation_audits_Allowed",
                table: "regulation_operation_audits",
                column: "Allowed");

            migrationBuilder.CreateIndex(
                name: "IX_regulation_operation_audits_UserId_CreatedAt",
                table: "regulation_operation_audits",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_user_regulation_profiles_CurrentLevel",
                table: "user_regulation_profiles",
                column: "CurrentLevel");

            migrationBuilder.CreateIndex(
                name: "IX_user_regulation_profiles_UserId",
                table: "user_regulation_profiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_regulation_requirements_Status",
                table: "user_regulation_requirements",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_user_regulation_requirements_UserId_Level",
                table: "user_regulation_requirements",
                columns: new[] { "UserId", "Level" });

            migrationBuilder.CreateIndex(
                name: "IX_user_regulation_requirements_UserId_Level_RequirementCode",
                table: "user_regulation_requirements",
                columns: new[] { "UserId", "Level", "RequirementCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "regulation_operation_audits");

            migrationBuilder.DropTable(
                name: "user_regulation_profiles");

            migrationBuilder.DropTable(
                name: "user_regulation_requirements");
        }
    }
}
