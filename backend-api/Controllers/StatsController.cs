using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend_api.Data;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StatsController(AppDbContext db) => _db = db;

    // GET /api/stats/dashboard
    // Thống kê tổng quan cá nhân ở trang Home
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var sessions = await _db.ExamSessions
            .Where(s => s.UserID == userId && s.Status != "In-Progress")
            .ToListAsync();

        int totalExams = sessions.Count;
        int passed = sessions.Count(s => s.Status == "Pass");
        int failed = sessions.Count(s => s.Status == "Fail");
        double passRate = totalExams > 0 ? Math.Round((double)passed / totalExams * 100, 1) : 0;
        double avgScore = totalExams > 0 ? Math.Round(sessions.Average(s => s.Score), 1) : 0;
        int wrongCount = await _db.WrongAnswerLogs.CountAsync(w => w.UserID == userId);

        // 5 lần thi gần nhất
        var recent = await _db.ExamSessions
            .Where(s => s.UserID == userId && s.Status != "In-Progress")
            .Include(s => s.LicenseType)
            .OrderByDescending(s => s.StartTime)
            .Take(5)
            .Select(s => new
            {
                s.SessionID,
                s.Score,
                s.Status,
                s.StartTime,
                LicenseType = s.LicenseType != null ? s.LicenseType.TypeName : "",
                PassingScore = s.LicenseType != null ? s.LicenseType.PassingScore : 0,
                TotalQuestions = s.LicenseType != null ? s.LicenseType.TotalQuestions : 0
            })
            .ToListAsync();

        return Ok(new
        {
            totalExams,
            passed,
            failed,
            passRate,
            avgScore,
            wrongCount,
            recentSessions = recent
        });
    }

    // GET /api/stats/history?page=1&pageSize=10
    // Toàn bộ lịch sử thi
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = _db.ExamSessions
            .Where(s => s.UserID == userId && s.Status != "In-Progress")
            .Include(s => s.LicenseType)
            .OrderByDescending(s => s.StartTime);

        var total = await query.CountAsync();
        var sessions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SessionID,
                s.Score,
                s.Status,
                s.HasCriticalError,
                s.StartTime,
                s.EndTime,
                LicenseType = s.LicenseType != null ? s.LicenseType.TypeName : "",
                PassingScore = s.LicenseType != null ? s.LicenseType.PassingScore : 0,
                TotalQuestions = s.LicenseType != null ? s.LicenseType.TotalQuestions : 0
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = sessions });
    }

    // GET /api/stats/wrong-answers?page=1&pageSize=20
    // Danh sách câu sai để ôn tập
    [HttpGet("wrong-answers")]
    public async Task<IActionResult> GetWrongAnswers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = _db.WrongAnswerLogs
            .Where(w => w.UserID == userId)
            .Include(w => w.Question)
                .ThenInclude(q => q!.Answers)
            .Include(w => w.Question)
                .ThenInclude(q => q!.Category)
            .OrderByDescending(w => w.ErrorCount);

        var total = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new
            {
                w.LogID,
                w.ErrorCount,
                w.LastAttempted,
                Question = new
                {
                    w.Question!.QuestionID,
                    w.Question.Content,
                    w.Question.ImageURL,
                    w.Question.Explanation,
                    w.Question.IsCritical,
                    CategoryName = w.Question.Category != null ? w.Question.Category.CategoryName : "",
                    Answers = w.Question.Answers.Select(a => new
                    {
                        a.AnswerID,
                        a.AnswerText,
                        a.IsCorrect
                    })
                }
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = logs });
    }

    // DELETE /api/stats/wrong-answers/{questionId}
    // Xóa 1 câu ra khỏi danh sách câu sai
    [HttpDelete("wrong-answers/{questionId}")]
    public async Task<IActionResult> RemoveWrongAnswer(int questionId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var log = await _db.WrongAnswerLogs
            .FirstOrDefaultAsync(w => w.UserID == userId && w.QuestionID == questionId);
        if (log == null) return NotFound();
        _db.WrongAnswerLogs.Remove(log);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã xóa khỏi danh sách câu sai." });
    }
}
