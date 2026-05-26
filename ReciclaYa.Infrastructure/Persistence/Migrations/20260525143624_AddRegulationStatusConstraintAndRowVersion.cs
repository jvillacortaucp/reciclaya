using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReciclaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRegulationStatusConstraintAndRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "user_regulation_requirements",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "user_regulation_profiles",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddCheckConstraint(
                name: "CK_user_regulation_requirements_status",
                table: "user_regulation_requirements",
                sql: "\"Status\" IN ('pending','uploaded','in_review','approved','rejected')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_user_regulation_requirements_status",
                table: "user_regulation_requirements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "user_regulation_requirements");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "user_regulation_profiles");
        }
    }
}
