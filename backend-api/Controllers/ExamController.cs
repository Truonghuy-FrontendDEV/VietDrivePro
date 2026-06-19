using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend_api.Data;
using backend_api.Models;

namespace backend_api.Controllers;

[ApiController]
[Route("api/exam")]
[Authorize]
public class ExamController : ControllerBase
{
    private readonly AppDbContext _db;
    public ExamController(AppDbContext db) => _db = db;

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET /api/exam/sample-exams/{licenseTypeId} ────────────────────────────
    [HttpGet("sample-exams/{licenseTypeId:int}")]
    public async Task<IActionResult> GetSampleExams(int licenseTypeId)
    {
        var exams = await _db.SampleExams
            .Where(s => s.LicenseTypeID == licenseTypeId)
            .Select(s => new { s.SampleExamID, s.ExamName, s.LicenseTypeID })
            .OrderBy(s => s.SampleExamID)
            .ToListAsync();
        return Ok(exams);
    }

    // ── POST /api/exam/start ──────────────────────────────────────────────────
    // FIX 1: Không pre-insert SessionDetails → tránh trigger bắn với NULL
    // FIX 2: Không dùng Guid.NewGuid() trong SQL → xáo đáp án ở C# memory
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartExamRequest dto)
    {
        try
        {
            var userId = GetUserId();

            var licenseType = await _db.LicenseTypes.FindAsync(dto.LicenseTypeID);
            if (licenseType == null)
                return BadRequest(new { message = "Hạng bằng không hợp lệ." });

            var rng = new Random();
            var questionIds = new List<int>();

            switch (dto.Mode?.ToLower())
            {
                // ── Đề mẫu ───────────────────────────────────────────────────
                case "sample":
                    if (!dto.SampleExamID.HasValue)
                        return BadRequest(new { message = "Vui lòng chọn đề mẫu." });

                    questionIds = await _db.SampleExamDetails
                        .Where(s => s.SampleExamID == dto.SampleExamID)
                        .Select(s => s.QuestionID)
                        .ToListAsync();

                    if (!questionIds.Any())
                        return BadRequest(new { message = "Đề mẫu này chưa có câu hỏi." });
                    break;

                // ── Ngẫu nhiên ────────────────────────────────────────────────
                case "random":
                    var blueprints = await _db.ExamBlueprints
                        .Where(b => b.LicenseTypeID == dto.LicenseTypeID)
                        .ToListAsync();

                    if (blueprints.Any())
                    {
                        // Có blueprint → lấy đúng số câu mỗi chương
                        foreach (var bp in blueprints)
                        {
                            // Load về C# memory rồi shuffle, KHÔNG shuffle trong SQL
                            var catIds = await _db.QuestionLicenseMaps
                                .Where(m => m.LicenseTypeID == dto.LicenseTypeID)
                                .Join(_db.Questions,
                                      m => m.QuestionID,
                                      q => q.QuestionID,
                                      (m, q) => new { q.QuestionID, q.CategoryID })
                                .Where(x => x.CategoryID == bp.CategoryID)
                                .Select(x => x.QuestionID)
                                .ToListAsync();  // ← load hết về memory

                            questionIds.AddRange(
                                catIds.OrderBy(_ => rng.Next()).Take(bp.QuestionCount));
                        }
                    }
                    else
                    {
                        // Không có blueprint → random toàn bộ
                        var allIds = await _db.QuestionLicenseMaps
                            .Where(m => m.LicenseTypeID == dto.LicenseTypeID)
                            .Select(m => m.QuestionID)
                            .ToListAsync();  // ← load hết về memory

                        questionIds = allIds
                            .OrderBy(_ => rng.Next())  // ← shuffle ở C#
                            .Take(licenseType.TotalQuestions)
                            .ToList();
                    }
                    break;

                // ── Ôn câu sai ────────────────────────────────────────────────
                case "wrong":
                    var wrongIds = await _db.WrongAnswerLogs
                        .Where(w => w.UserID == userId)
                        .OrderByDescending(w => w.ErrorCount)
                        .Select(w => w.QuestionID)
                        .ToListAsync();

                    if (!wrongIds.Any())
                        return BadRequest(new { message = "Bạn chưa có câu sai nào để ôn tập!" });

                    questionIds = wrongIds.Take(licenseType.TotalQuestions).ToList();
                    break;

                default:
                    return BadRequest(new { message = "Mode không hợp lệ. Dùng: sample | random | wrong" });
            }

            if (!questionIds.Any())
                return BadRequest(new { message = "Không đủ câu hỏi để tạo đề thi." });

            // ── Tạo ExamSession ───────────────────────────────────────────────
            var session = new ExamSession
            {
                UserID           = userId,
                LicenseTypeID    = dto.LicenseTypeID,
                StartTime        = DateTime.Now,
                Status           = "In-Progress",
                Score            = 0,
                HasCriticalError = false
            };
            _db.ExamSessions.Add(session);
            await _db.SaveChangesAsync();

            // ── KHÔNG pre-insert SessionDetails ──────────────────────────────
            // Trigger trg_CheckCriticalError / trg_UpdateExamResult trên bảng
            // SessionDetails sẽ bắn ngay khi INSERT với IsCorrect = NULL → lỗi
            // Giải pháp: chỉ insert SessionDetail khi user chọn đáp án
            // Load toàn bộ câu hỏi về memory trước
            var allQuestions = await _db.Questions
                .Include(q => q.Answers)
                .Include(q => q.Category)
                .ToListAsync();

            // Sau đó filter trong C#
            var questionsRaw = allQuestions
                .Where(q => questionIds.Contains(q.QuestionID))
                .ToList();

            // Giữ đúng thứ tự questionIds
            var questionsOut = questionIds
                .Select(id => questionsRaw.FirstOrDefault(q => q.QuestionID == id))
                .Where(q => q != null)
                .Select(q => new
                {
                    questionID   = q!.QuestionID,
                    content      = q.Content,
                    imageURL     = q.ImageURL,
                    isCritical   = q.IsCritical,
                    categoryID   = q.CategoryID,
                    categoryName = q.Category?.CategoryName ?? "",
                    // Xáo đáp án ở C# - KHÔNG sinh NEWID() trong SQL
                    answers = q.Answers
                        .OrderBy(_ => rng.Next())
                        .Select(a => new { answerID = a.AnswerID, answerText = a.AnswerText })
                        .ToList()
                })
                .ToList();

            return Ok(new
            {
                sessionID        = session.SessionID,
                licenseTypeID    = session.LicenseTypeID,
                startTime        = session.StartTime,
                timeLimitSeconds = licenseType.TimeLimit,
                totalQuestions   = licenseType.TotalQuestions,
                passingScore     = licenseType.PassingScore,
                licenseTypeName  = licenseType.TypeName,
                questions        = questionsOut
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine("=== START EXAM ERROR ===");
            Console.WriteLine($"Message:   {ex.Message}");
            Console.WriteLine($"Inner:     {ex.InnerException?.Message}");
            Console.WriteLine($"StackTrace:{ex.StackTrace}");
            return StatusCode(500, new
            {
                message = "Lỗi server: " + ex.Message,
                detail  = ex.InnerException?.Message
            });
        }
    }

    // ── POST /api/exam/answer ─────────────────────────────────────────────────
    // Upsert: tạo mới nếu chưa có, cập nhật nếu đổi đáp án
    [HttpPost("answer")]
    public async Task<IActionResult> Answer([FromBody] AnswerRequest dto)
    {
        var userId = GetUserId();

        var session = await _db.ExamSessions
            .FirstOrDefaultAsync(s => s.SessionID == dto.SessionID && s.UserID == userId);
        if (session == null)
            return NotFound(new { message = "Session không tồn tại." });
        if (session.Status != "In-Progress")
            return BadRequest(new { message = "Bài thi đã kết thúc." });

        var answer = await _db.Answers
            .FirstOrDefaultAsync(a => a.AnswerID == dto.AnswerID && a.QuestionID == dto.QuestionID);
        if (answer == null)
            return BadRequest(new { message = "Đáp án không hợp lệ." });

        var detail = await _db.SessionDetails
            .FirstOrDefaultAsync(d => d.SessionID == dto.SessionID && d.QuestionID == dto.QuestionID);

        if (detail == null)
        {
            _db.SessionDetails.Add(new SessionDetail
            {
                SessionID        = dto.SessionID,
                QuestionID       = dto.QuestionID,
                SelectedAnswerID = dto.AnswerID,
                IsCorrect        = answer.IsCorrect
            });
        }
        else
        {
            detail.SelectedAnswerID = dto.AnswerID;
            detail.IsCorrect        = answer.IsCorrect;
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true, isCorrect = answer.IsCorrect });
    }

    // ── POST /api/exam/submit/{sessionId} ─────────────────────────────────────
    [HttpPost("submit/{sessionId:int}")]
    public async Task<IActionResult> Submit(int sessionId)
    {
        var userId = GetUserId();

        var session = await _db.ExamSessions
            .Include(s => s.LicenseType)
            .Include(s => s.SessionDetails)
            .FirstOrDefaultAsync(s => s.SessionID == sessionId && s.UserID == userId);

        if (session == null)
            return NotFound(new { message = "Session không tồn tại." });
        if (session.Status != "In-Progress")
            return BadRequest(new { message = "Bài thi đã được nộp rồi." });

        var lt = session.LicenseType!;

        int correct = session.SessionDetails.Count(d => d.IsCorrect == true);

        var wrongQids = session.SessionDetails
            .Where(d => d.IsCorrect == false)
            .Select(d => d.QuestionID)
            .ToList();

                // Load về memory trước
        var allQuestions = await _db.Questions.ToListAsync();

        // Check trong C#
        bool hasCritical = wrongQids.Any()
            && allQuestions.Any(q => wrongQids.Contains(q.QuestionID) && q.IsCritical);

        session.Score            = correct;
        session.EndTime          = DateTime.Now;
        session.HasCriticalError = hasCritical;
        session.Status           = hasCritical ? "Fail" : (correct >= lt.PassingScore ? "Pass" : "Fail");

        // Ghi WrongAnswerLogs
        foreach (var d in session.SessionDetails.Where(x => x.IsCorrect == false))
        {
            var log = await _db.WrongAnswerLogs
                .FirstOrDefaultAsync(w => w.UserID == userId && w.QuestionID == d.QuestionID);
            if (log == null)
                _db.WrongAnswerLogs.Add(new WrongAnswerLog
                    { UserID = userId, QuestionID = d.QuestionID, ErrorCount = 1, LastAttempted = DateTime.Now });
            else { log.ErrorCount++; log.LastAttempted = DateTime.Now; }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            sessionID        = session.SessionID,
            score            = session.Score,
            status           = session.Status,
            hasCriticalError = session.HasCriticalError,
            totalAnswered    = session.SessionDetails.Count,
            passingScore     = lt.PassingScore,
            licenseType      = lt.TypeName
        });
    }

    // ── GET /api/exam/result/{sessionId} ──────────────────────────────────────
    [HttpGet("result/{sessionId:int}")]
    public async Task<IActionResult> Result(int sessionId)
    {
        var userId = GetUserId();

        var session = await _db.ExamSessions
            .Include(s => s.LicenseType)
            .FirstOrDefaultAsync(s => s.SessionID == sessionId && s.UserID == userId);
        if (session == null) return NotFound();

        var details = await _db.SessionDetails
            .Where(d => d.SessionID == sessionId)
            .Include(d => d.Question).ThenInclude(q => q!.Answers)
            .Include(d => d.Question).ThenInclude(q => q!.Category)
            .Include(d => d.SelectedAnswer)
            .OrderBy(d => d.DetailID)
            .ToListAsync();

        return Ok(new
        {
            sessionID        = session.SessionID,
            score            = session.Score,
            status           = session.Status,
            hasCriticalError = session.HasCriticalError,
            startTime        = session.StartTime,
            endTime          = session.EndTime,
            licenseType      = session.LicenseType?.TypeName,
            passingScore     = session.LicenseType?.PassingScore,
            totalQuestions   = details.Count,
            details          = details.Select(d => new
            {
                d.QuestionID,
                questionContent    = d.Question?.Content,
                questionImage      = d.Question?.ImageURL,
                explanation        = d.Question?.Explanation,
                isCritical         = d.Question?.IsCritical,
                categoryName       = d.Question?.Category?.CategoryName,
                d.SelectedAnswerID,
                selectedAnswerText = d.SelectedAnswer?.AnswerText,
                d.IsCorrect,
                answers = d.Question?.Answers.Select(a => new
                    { a.AnswerID, a.AnswerText, a.IsCorrect })
            })
        });
    }

    // ── GET /api/exam/active ──────────────────────────────────────────────────
    [HttpGet("active")]
    public async Task<IActionResult> Active()
    {
        var userId = GetUserId();
        var s = await _db.ExamSessions
            .Where(x => x.UserID == userId && x.Status == "In-Progress")
            .OrderByDescending(x => x.StartTime)
            .Select(x => new { x.SessionID, x.LicenseTypeID, x.StartTime })
            .FirstOrDefaultAsync();
        return Ok(s);
    }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
public record StartExamRequest(int LicenseTypeID, string Mode, int? SampleExamID);
public record AnswerRequest(int SessionID, int QuestionID, int AnswerID);