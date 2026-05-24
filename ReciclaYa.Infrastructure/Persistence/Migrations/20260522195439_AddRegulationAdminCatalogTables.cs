using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRegulationAdminCatalogTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "regulation_catalog_versions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_catalog_versions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "regulation_allowed_residues_catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    CategoryTitle = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    ResidueName = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    QuantityMin = table.Column<decimal>(type: "numeric(18,3)", nullable: true),
                    QuantityMax = table.Column<decimal>(type: "numeric(18,3)", nullable: true),
                    Unit = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_allowed_residues_catalog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_regulation_allowed_residues_catalog_regulation_catalog_vers~",
                        column: x => x.VersionId,
                        principalTable: "regulation_catalog_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "regulation_level_requirements_catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    RequirementCode = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ActorType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AcceptedFileTypesJson = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_level_requirements_catalog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_regulation_level_requirements_catalog_regulation_catalog_ve~",
                        column: x => x.VersionId,
                        principalTable: "regulation_catalog_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "regulation_level_rules_catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    RuleGroup = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ItemText = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_level_rules_catalog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_regulation_level_rules_catalog_regulation_catalog_versions_~",
                        column: x => x.VersionId,
                        principalTable: "regulation_catalog_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "regulation_normative_references_catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Article = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ReferenceUrl = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regulation_normative_references_catalog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_regulation_normative_references_catalog_regulation_catalog_~",
                        column: x => x.VersionId,
                        principalTable: "regulation_catalog_versions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_allowed_residues_catalog_VersionId_Level_IsActive",
                table: "regulation_allowed_residues_catalog",
                columns: new[] { "VersionId", "Level", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_allowed_residues_catalog_VersionId_ResidueName",
                table: "regulation_allowed_residues_catalog",
                columns: new[] { "VersionId", "ResidueName" });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_catalog_versions_IsActive",
                table: "regulation_catalog_versions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_regulation_catalog_versions_VersionNumber",
                table: "regulation_catalog_versions",
                column: "VersionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_regulation_level_requirements_catalog_VersionId_Level_IsAct~",
                table: "regulation_level_requirements_catalog",
                columns: new[] { "VersionId", "Level", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_level_requirements_catalog_VersionId_Requirement~",
                table: "regulation_level_requirements_catalog",
                columns: new[] { "VersionId", "RequirementCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_regulation_level_rules_catalog_VersionId_Level_RuleGroup_Is~",
                table: "regulation_level_rules_catalog",
                columns: new[] { "VersionId", "Level", "RuleGroup", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_regulation_normative_references_catalog_VersionId_Level_IsA~",
                table: "regulation_normative_references_catalog",
                columns: new[] { "VersionId", "Level", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "regulation_allowed_residues_catalog");

            migrationBuilder.DropTable(
                name: "regulation_level_requirements_catalog");

            migrationBuilder.DropTable(
                name: "regulation_level_rules_catalog");

            migrationBuilder.DropTable(
                name: "regulation_normative_references_catalog");

            migrationBuilder.DropTable(
                name: "regulation_catalog_versions");
        }
    }
}
