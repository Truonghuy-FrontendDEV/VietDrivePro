using Microsoft.EntityFrameworkCore;
using backend_api.Models;

namespace backend_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ─── DbSets ────────────────────────────────────────────────
    public DbSet<User> Users { get; set; }
    public DbSet<LicenseType> LicenseTypes { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<TrafficSign> TrafficSigns { get; set; }
    public DbSet<Regulation> Regulations { get; set; }
    public DbSet<ExamSession> ExamSessions { get; set; }
    public DbSet<SessionDetail> SessionDetails { get; set; }
    public DbSet<WrongAnswerLog> WrongAnswerLogs { get; set; }
    public DbSet<SampleExam> SampleExams { get; set; }
    public DbSet<SampleExamDetail> SampleExamDetails { get; set; }
    public DbSet<ExamBlueprint> ExamBlueprints { get; set; }
    public DbSet<QuestionLicenseMap> QuestionLicenseMaps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── 1. PRIMARY KEYS ─────────────────────────────────────
        modelBuilder.Entity<User>().HasKey(u => u.UserID);
        modelBuilder.Entity<LicenseType>().HasKey(l => l.LicenseTypeID);
        modelBuilder.Entity<Category>().HasKey(c => c.CategoryID);
        modelBuilder.Entity<Question>().HasKey(q => q.QuestionID);
        modelBuilder.Entity<Answer>().HasKey(a => a.AnswerID);
        modelBuilder.Entity<TrafficSign>().HasKey(t => t.SignID);
        modelBuilder.Entity<Regulation>().HasKey(r => r.RegulationID);
        modelBuilder.Entity<ExamSession>().HasKey(e => e.SessionID);
        modelBuilder.Entity<SessionDetail>().HasKey(sd => sd.DetailID);
        modelBuilder.Entity<SampleExam>().HasKey(s => s.SampleExamID);
        modelBuilder.Entity<ExamBlueprint>().HasKey(e => e.BlueprintID);
        modelBuilder.Entity<WrongAnswerLog>().HasKey(w => w.LogID);

        // ── 2. COMPOSITE KEYS ───────────────────────────────────
        modelBuilder.Entity<SampleExamDetail>()
            .HasKey(s => new { s.SampleExamID, s.QuestionID });

        modelBuilder.Entity<QuestionLicenseMap>()
            .HasKey(q => new { q.QuestionID, q.LicenseTypeID });

        // ── 3. RELATIONSHIPS ────────────────────────────────────

        // SampleExamDetail
        modelBuilder.Entity<SampleExamDetail>()
            .HasOne(s => s.SampleExam)
            .WithMany(se => se.SampleExamDetails)
            .HasForeignKey(s => s.SampleExamID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SampleExamDetail>()
            .HasOne(s => s.Question)
            .WithMany()
            .HasForeignKey(s => s.QuestionID)
            .OnDelete(DeleteBehavior.NoAction);

        // QuestionLicenseMap
        modelBuilder.Entity<QuestionLicenseMap>()
            .ToTable("QuestionLicenseMap"); // 🔥 FIX lỗi 500

        modelBuilder.Entity<QuestionLicenseMap>()
            .HasKey(q => new { q.QuestionID, q.LicenseTypeID });

        modelBuilder.Entity<QuestionLicenseMap>()
            .HasOne(q => q.Question)
            .WithMany(q => q.QuestionLicenseMaps)
            .HasForeignKey(q => q.QuestionID);

        modelBuilder.Entity<QuestionLicenseMap>()
            .HasOne(q => q.LicenseType)
            .WithMany()
            .HasForeignKey(q => q.LicenseTypeID);

        // WrongAnswerLog
        modelBuilder.Entity<WrongAnswerLog>()
            .HasIndex(w => new { w.UserID, w.QuestionID })
            .IsUnique()
            .HasDatabaseName("UC_User_Question");

        modelBuilder.Entity<WrongAnswerLog>()
            .HasOne(w => w.Question)
            .WithMany()
            .HasForeignKey(w => w.QuestionID)
            .OnDelete(DeleteBehavior.NoAction);

        // ExamBlueprint
        modelBuilder.Entity<ExamBlueprint>()
            .HasIndex(e => new { e.LicenseTypeID, e.CategoryID })
            .IsUnique()
            .HasDatabaseName("UC_License_Category");

        modelBuilder.Entity<ExamBlueprint>()
            .HasOne(e => e.Category)
            .WithMany()
            .HasForeignKey(e => e.CategoryID)
            .OnDelete(DeleteBehavior.NoAction);

        // Question
        modelBuilder.Entity<Question>()
            .HasMany(q => q.Answers)
            .WithOne()
            .HasForeignKey(a => a.QuestionID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Category)
            .WithMany()
            .HasForeignKey(q => q.CategoryID)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.TrafficSign)
            .WithMany()
            .HasForeignKey(q => q.SignID)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Regulation)
            .WithMany()
            .HasForeignKey(q => q.RegulationID)
            .OnDelete(DeleteBehavior.NoAction);

        // SessionDetail
        modelBuilder.Entity<SessionDetail>()
            .HasOne(sd => sd.Question)
            .WithMany()
            .HasForeignKey(sd => sd.QuestionID)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<SessionDetail>()
            .HasOne(sd => sd.SelectedAnswer)
            .WithMany()
            .HasForeignKey(sd => sd.SelectedAnswerID)
            .OnDelete(DeleteBehavior.NoAction);

        // ExamSession
        modelBuilder.Entity<ExamSession>()
            .HasMany(e => e.SessionDetails)
            .WithOne()
            .HasForeignKey(sd => sd.SessionID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ExamSession>()
            .HasOne(e => e.LicenseType)
            .WithMany()
            .HasForeignKey(e => e.LicenseTypeID)
            .OnDelete(DeleteBehavior.NoAction);

        // SampleExam
        modelBuilder.Entity<SampleExam>()
            .HasMany(s => s.SampleExamDetails)
            .WithOne()
            .HasForeignKey(sd => sd.SampleExamID)
            .OnDelete(DeleteBehavior.Cascade);
    }
}