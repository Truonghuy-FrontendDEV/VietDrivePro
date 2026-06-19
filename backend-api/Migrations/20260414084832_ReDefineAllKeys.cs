using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_api.Migrations
{
    /// <inheritdoc />
    public partial class ReDefineAllKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IconURL = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "LicenseTypes",
                columns: table => new
                {
                    LicenseTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeLimit = table.Column<int>(type: "int", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    PassingScore = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LicenseTypes", x => x.LicenseTypeID);
                });

            migrationBuilder.CreateTable(
                name: "Regulations",
                columns: table => new
                {
                    RegulationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PenaltyRange = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regulations", x => x.RegulationID);
                });

            migrationBuilder.CreateTable(
                name: "TrafficSigns",
                columns: table => new
                {
                    SignID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SignCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SignType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageURL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrafficSigns", x => x.SignID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AvatarURL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "ExamBlueprints",
                columns: table => new
                {
                    BlueprintID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LicenseTypeID = table.Column<int>(type: "int", nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: false),
                    QuestionCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamBlueprints", x => x.BlueprintID);
                    table.ForeignKey(
                        name: "FK_ExamBlueprints_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID");
                    table.ForeignKey(
                        name: "FK_ExamBlueprints_LicenseTypes_LicenseTypeID",
                        column: x => x.LicenseTypeID,
                        principalTable: "LicenseTypes",
                        principalColumn: "LicenseTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExamSessions",
                columns: table => new
                {
                    SessionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    LicenseTypeID = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    HasCriticalError = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSessions", x => x.SessionID);
                    table.ForeignKey(
                        name: "FK_ExamSessions_LicenseTypes_LicenseTypeID",
                        column: x => x.LicenseTypeID,
                        principalTable: "LicenseTypes",
                        principalColumn: "LicenseTypeID");
                });

            migrationBuilder.CreateTable(
                name: "SampleExams",
                columns: table => new
                {
                    SampleExamID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExamName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LicenseTypeID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SampleExams", x => x.SampleExamID);
                    table.ForeignKey(
                        name: "FK_SampleExams_LicenseTypes_LicenseTypeID",
                        column: x => x.LicenseTypeID,
                        principalTable: "LicenseTypes",
                        principalColumn: "LicenseTypeID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    QuestionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageURL = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Explanation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsCritical = table.Column<bool>(type: "bit", nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: false),
                    SignID = table.Column<int>(type: "int", nullable: true),
                    RegulationID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.QuestionID);
                    table.ForeignKey(
                        name: "FK_Questions_Categories_CategoryID",
                        column: x => x.CategoryID,
                        principalTable: "Categories",
                        principalColumn: "CategoryID");
                    table.ForeignKey(
                        name: "FK_Questions_Regulations_RegulationID",
                        column: x => x.RegulationID,
                        principalTable: "Regulations",
                        principalColumn: "RegulationID");
                    table.ForeignKey(
                        name: "FK_Questions_TrafficSigns_SignID",
                        column: x => x.SignID,
                        principalTable: "TrafficSigns",
                        principalColumn: "SignID");
                });

            migrationBuilder.CreateTable(
                name: "Answers",
                columns: table => new
                {
                    AnswerID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionID = table.Column<int>(type: "int", nullable: false),
                    AnswerText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Answers", x => x.AnswerID);
                    table.ForeignKey(
                        name: "FK_Answers_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionLicenseMaps",
                columns: table => new
                {
                    QuestionID = table.Column<int>(type: "int", nullable: false),
                    LicenseTypeID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionLicenseMaps", x => new { x.QuestionID, x.LicenseTypeID });
                    table.ForeignKey(
                        name: "FK_QuestionLicenseMaps_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SampleExamDetails",
                columns: table => new
                {
                    SampleExamID = table.Column<int>(type: "int", nullable: false),
                    QuestionID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SampleExamDetails", x => new { x.SampleExamID, x.QuestionID });
                    table.ForeignKey(
                        name: "FK_SampleExamDetails_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID");
                    table.ForeignKey(
                        name: "FK_SampleExamDetails_SampleExams_SampleExamID",
                        column: x => x.SampleExamID,
                        principalTable: "SampleExams",
                        principalColumn: "SampleExamID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WrongAnswerLogs",
                columns: table => new
                {
                    LogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    QuestionID = table.Column<int>(type: "int", nullable: false),
                    LastAttempted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ErrorCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WrongAnswerLogs", x => x.LogID);
                    table.ForeignKey(
                        name: "FK_WrongAnswerLogs_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID");
                });

            migrationBuilder.CreateTable(
                name: "SessionDetails",
                columns: table => new
                {
                    DetailID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionID = table.Column<int>(type: "int", nullable: false),
                    QuestionID = table.Column<int>(type: "int", nullable: false),
                    SelectedAnswerID = table.Column<int>(type: "int", nullable: true),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionDetails", x => x.DetailID);
                    table.ForeignKey(
                        name: "FK_SessionDetails_Answers_SelectedAnswerID",
                        column: x => x.SelectedAnswerID,
                        principalTable: "Answers",
                        principalColumn: "AnswerID");
                    table.ForeignKey(
                        name: "FK_SessionDetails_ExamSessions_SessionID",
                        column: x => x.SessionID,
                        principalTable: "ExamSessions",
                        principalColumn: "SessionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionDetails_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Answers_QuestionID",
                table: "Answers",
                column: "QuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_ExamBlueprints_CategoryID",
                table: "ExamBlueprints",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "UC_License_Category",
                table: "ExamBlueprints",
                columns: new[] { "LicenseTypeID", "CategoryID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamSessions_LicenseTypeID",
                table: "ExamSessions",
                column: "LicenseTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_CategoryID",
                table: "Questions",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_RegulationID",
                table: "Questions",
                column: "RegulationID");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_SignID",
                table: "Questions",
                column: "SignID");

            migrationBuilder.CreateIndex(
                name: "IX_SampleExamDetails_QuestionID",
                table: "SampleExamDetails",
                column: "QuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_SampleExams_LicenseTypeID",
                table: "SampleExams",
                column: "LicenseTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_SessionDetails_QuestionID",
                table: "SessionDetails",
                column: "QuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_SessionDetails_SelectedAnswerID",
                table: "SessionDetails",
                column: "SelectedAnswerID");

            migrationBuilder.CreateIndex(
                name: "IX_SessionDetails_SessionID",
                table: "SessionDetails",
                column: "SessionID");

            migrationBuilder.CreateIndex(
                name: "IX_WrongAnswerLogs_QuestionID",
                table: "WrongAnswerLogs",
                column: "QuestionID");

            migrationBuilder.CreateIndex(
                name: "UC_User_Question",
                table: "WrongAnswerLogs",
                columns: new[] { "UserID", "QuestionID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamBlueprints");

            migrationBuilder.DropTable(
                name: "QuestionLicenseMaps");

            migrationBuilder.DropTable(
                name: "SampleExamDetails");

            migrationBuilder.DropTable(
                name: "SessionDetails");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WrongAnswerLogs");

            migrationBuilder.DropTable(
                name: "SampleExams");

            migrationBuilder.DropTable(
                name: "Answers");

            migrationBuilder.DropTable(
                name: "ExamSessions");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "LicenseTypes");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Regulations");

            migrationBuilder.DropTable(
                name: "TrafficSigns");
        }
    }
}
