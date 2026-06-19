using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Data;
using backend_api.Models;
using backend_api.DTOs.Admin;

namespace backend_api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminController(AppDbContext db) => _db = db;

    // ════════════════════════════════════════════════════════════════════════
    // OVERVIEW — Tổng quan hệ thống
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("overview")]
    public async Task<IActionResult> Overview()
    {
        var since = DateTime.Now.AddDays(-7);

        var totalUsers = await _db.Users.CountAsync(u => u.Role == "User");
        var totalExams = await _db.ExamSessions.CountAsync(s => s.Status != "In-Progress");
        var passedExams = await _db.ExamSessions.CountAsync(s => s.Status == "Pass");
        var failedExams = await _db.ExamSessions.CountAsync(s => s.Status == "Fail");
        var totalQuestions = await _db.Questions.CountAsync();
        var totalSigns = await _db.TrafficSigns.CountAsync();
        var totalRegs = await _db.Regulations.CountAsync();

        var passRate = totalExams > 0 ? Math.Round((double)passedExams / totalExams * 100, 1) : 0;

        var daily7days = await _db.ExamSessions
            .Where(s => s.StartTime >= since && s.Status != "In-Progress")
            .GroupBy(s => s.StartTime.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .OrderBy(g => g.date)
            .ToListAsync();

        return Ok(new
        {
            totalUsers,
            totalExams,
            passedExams,
            failedExams,
            totalQuestions,
            totalSigns,
            totalRegs,
            passRate,
            daily7days
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // USERS — Quản lý người dùng
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.UserID,
                u.FullName,
                u.Email,
                u.Role,
                u.CreatedAt,
                u.IsLocked
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = users });
    }

    [HttpPut("users/{id:int}/lock")]
    public async Task<IActionResult> ToggleLock(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (user.Role == "Admin")
            return BadRequest(new { message = "Không thể khóa tài khoản Admin." });

        user.IsLocked = !user.IsLocked;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = user.IsLocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
            user.IsLocked
        });
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            if (user.Role == "Admin")
                return BadRequest(new { message = "Không thể xóa tài khoản Admin." });

            // 1. Xóa WrongAnswerLogs theo UserID (ĐÚNG - không có cột SessionID)
            var wrongLogs = await _db.WrongAnswerLogs
                .Where(w => w.UserID == id)
                .ToListAsync();
            _db.WrongAnswerLogs.RemoveRange(wrongLogs);

            // 2. Xóa SessionDetails và các dữ liệu liên quan
            var sessionIds = await _db.ExamSessions
                .Where(s => s.UserID == id)
                .Select(s => s.SessionID)
                .ToListAsync();

            if (sessionIds.Any())
            {
                var sessionDetails = await _db.SessionDetails
                    .Where(d => sessionIds.Contains(d.SessionID))
                    .ToListAsync();
                _db.SessionDetails.RemoveRange(sessionDetails);
            }

            // 3. Xóa SampleExamDetails và SampleExams liên quan đến các session
            foreach (var sessionId in sessionIds)
            {
                var sampleExams = await _db.SampleExams
                    .Where(se => se.SessionID == sessionId)
                    .ToListAsync();

                foreach (var se in sampleExams)
                {
                    _db.SampleExamDetails.RemoveRange(
                        _db.SampleExamDetails.Where(d => d.SampleExamID == se.SampleExamID)
                    );
                }
                _db.SampleExams.RemoveRange(sampleExams);
            }

            // 4. Xóa ExamSessions
            var sessions = await _db.ExamSessions
                .Where(s => s.UserID == id)
                .ToListAsync();
            _db.ExamSessions.RemoveRange(sessions);

            // 5. Xóa user
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã xóa người dùng." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa người dùng.", error = ex.Message });
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // QUESTIONS — Quản lý câu hỏi
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] int? categoryId,
        [FromQuery] int? licenseTypeId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.Category)
            .Include(q => q.QuestionLicenseMaps)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(q => q.CategoryID == categoryId);
        if (licenseTypeId.HasValue)
            query = query.Where(q => q.QuestionLicenseMaps.Any(m => m.LicenseTypeID == licenseTypeId));
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(q => q.Content.Contains(search));

        var total = await query.CountAsync();
        var questions = await query
            .OrderBy(q => q.QuestionID)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                q.Explanation,
                q.IsCritical,
                q.CategoryID,
                CategoryName = q.Category != null ? q.Category.CategoryName : "",
                LicenseTypeIDs = q.QuestionLicenseMaps.Select(m => m.LicenseTypeID),
                Answers = q.Answers.Select(a => new { a.AnswerID, a.AnswerText, a.IsCorrect })
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = questions });
    }

    [HttpPost("questions")]
    public async Task<IActionResult> CreateQuestion([FromBody] QuestionUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "Nội dung câu hỏi không được trống." });
        if (dto.Answers.Count < 2)
            return BadRequest(new { message = "Phải có ít nhất 2 đáp án." });
        if (!dto.Answers.Any(a => a.IsCorrect))
            return BadRequest(new { message = "Phải có ít nhất 1 đáp án đúng." });

        var question = new Question
        {
            Content = dto.Content.Trim(),
            ImageURL = dto.ImageURL,
            Explanation = dto.Explanation,
            IsCritical = dto.IsCritical,
            CategoryID = dto.CategoryID
        };

        _db.Questions.Add(question);
        await _db.SaveChangesAsync();

        foreach (var a in dto.Answers.Where(a => !string.IsNullOrWhiteSpace(a.AnswerText)))
        {
            _db.Answers.Add(new Answer
            {
                QuestionID = question.QuestionID,
                AnswerText = a.AnswerText.Trim(),
                IsCorrect = a.IsCorrect
            });
        }

        foreach (var ltId in dto.LicenseTypeIDs.Distinct())
        {
            _db.QuestionLicenseMaps.Add(new QuestionLicenseMap
            {
                QuestionID = question.QuestionID,
                LicenseTypeID = ltId
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Thêm câu hỏi thành công.", question.QuestionID });
    }

    [HttpPut("questions/{id:int}")]
    public async Task<IActionResult> UpdateQuestion(int id, [FromBody] QuestionUpsertDto dto)
    {
        var question = await _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.QuestionLicenseMaps)
            .FirstOrDefaultAsync(q => q.QuestionID == id);

        if (question == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "Nội dung câu hỏi không được trống." });

        if (dto.Answers == null || !dto.Answers.Any())
            return BadRequest(new { message = "Phải có ít nhất 1 đáp án." });

        if (!dto.Answers.Any(a => a.IsCorrect))
            return BadRequest(new { message = "Phải có ít nhất 1 đáp án đúng." });

        // Cập nhật thông tin câu hỏi
        question.Content = dto.Content.Trim();
        question.ImageURL = dto.ImageURL;
        question.Explanation = dto.Explanation;
        question.IsCritical = dto.IsCritical;
        question.CategoryID = dto.CategoryID;

        // Cập nhật đáp án cũ (KHÔNG XÓA)
        var existingAnswers = question.Answers.ToList();
        var newAnswers = dto.Answers.Where(a => !string.IsNullOrWhiteSpace(a.AnswerText)).ToList();

        for (int i = 0; i < newAnswers.Count; i++)
        {
            if (i < existingAnswers.Count)
            {
                existingAnswers[i].AnswerText = newAnswers[i].AnswerText.Trim();
                existingAnswers[i].IsCorrect = newAnswers[i].IsCorrect;
            }
            else
            {
                _db.Answers.Add(new Answer
                {
                    QuestionID = id,
                    AnswerText = newAnswers[i].AnswerText.Trim(),
                    IsCorrect = newAnswers[i].IsCorrect
                });
            }
        }

        // Xóa và thêm lại license types
        _db.QuestionLicenseMaps.RemoveRange(question.QuestionLicenseMaps);

        if (dto.LicenseTypeIDs != null && dto.LicenseTypeIDs.Any())
        {
            foreach (var ltId in dto.LicenseTypeIDs.Distinct())
            {
                _db.QuestionLicenseMaps.Add(new QuestionLicenseMap
                {
                    QuestionID = id,
                    LicenseTypeID = ltId
                });
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật câu hỏi thành công." });
    }

    [HttpDelete("questions/{id:int}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        var question = await _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.QuestionLicenseMaps)
            .FirstOrDefaultAsync(q => q.QuestionID == id);

        if (question == null) return NotFound();

        // Kiểm tra xem câu hỏi có được sử dụng trong lịch sử thi không
        var hasHistory = await _db.SessionDetails
            .AnyAsync(sd => sd.QuestionID == id);

        if (hasHistory)
        {
            return BadRequest(new { message = "Câu hỏi đã được sử dụng trong lịch sử thi, không thể xóa." });
        }

        // Xóa các bảng liên quan
        if (question.Answers != null && question.Answers.Any())
            _db.Answers.RemoveRange(question.Answers);

        if (question.QuestionLicenseMaps != null && question.QuestionLicenseMaps.Any())
            _db.QuestionLicenseMaps.RemoveRange(question.QuestionLicenseMaps);

        _db.Questions.Remove(question);

        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa câu hỏi." });
    }

    // ════════════════════════════════════════════════════════════════════════
    // TRAFFIC SIGNS — Quản lý biển báo giao thông
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("traffic-signs")]
    public async Task<IActionResult> GetTrafficSigns(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var query = _db.TrafficSigns.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => s.SignName.Contains(search) || s.SignCode.Contains(search));
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderBy(s => s.SignID)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SignID,
                s.SignCode,
                s.SignName,
                s.SignType,
                s.ImageURL,
                s.Description
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("signs")]
    public async Task<IActionResult> CreateSign([FromBody] TrafficSignUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SignCode) || string.IsNullOrWhiteSpace(dto.SignName))
            return BadRequest(new { message = "Mã và tên biển không được trống." });

        var sign = new TrafficSign
        {
            SignCode = dto.SignCode.Trim(),
            SignName = dto.SignName.Trim(),
            SignType = dto.SignType,
            ImageURL = dto.ImageURL,
            Description = dto.Description
        };

        _db.TrafficSigns.Add(sign);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Thêm biển báo thành công.", sign.SignID });
    }

    [HttpPut("signs/{id:int}")]
    public async Task<IActionResult> UpdateSign(int id, [FromBody] TrafficSignUpsertDto dto)
    {
        var sign = await _db.TrafficSigns.FindAsync(id);
        if (sign == null) return NotFound();

        sign.SignCode = dto.SignCode.Trim();
        sign.SignName = dto.SignName.Trim();
        sign.SignType = dto.SignType;
        sign.ImageURL = dto.ImageURL;
        sign.Description = dto.Description;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật biển báo thành công." });
    }

    [HttpDelete("signs/{id:int}")]
    public async Task<IActionResult> DeleteSign(int id)
    {
        var sign = await _db.TrafficSigns.FindAsync(id);
        if (sign == null) return NotFound();

        _db.TrafficSigns.Remove(sign);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa biển báo." });
    }

    // ════════════════════════════════════════════════════════════════════════
    // REGULATIONS — Quản lý văn bản luật
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("regulations")]
    public async Task<IActionResult> GetRegulations(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var query = _db.Regulations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(r => r.Title.Contains(search));
        }

        var total = await query.CountAsync();
        var data = await query
            .OrderByDescending(r => r.LastUpdated)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.RegulationID,
                r.Title,
                r.Content,
                r.PenaltyRange,
                r.LastUpdated
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data });
    }

    [HttpPost("regulations")]
    public async Task<IActionResult> CreateRegulation([FromBody] RegulationUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "Tiêu đề và nội dung không được trống." });

        var reg = new Regulation
        {
            Title = dto.Title.Trim(),
            Content = dto.Content.Trim(),
            PenaltyRange = dto.PenaltyRange,
            LastUpdated = DateTime.Now
        };

        _db.Regulations.Add(reg);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Thêm văn bản luật thành công.", reg.RegulationID });
    }

    [HttpPut("regulations/{id:int}")]
    public async Task<IActionResult> UpdateRegulation(int id, [FromBody] RegulationUpsertDto dto)
    {
        var reg = await _db.Regulations.FindAsync(id);
        if (reg == null) return NotFound();

        reg.Title = dto.Title.Trim();
        reg.Content = dto.Content.Trim();
        reg.PenaltyRange = dto.PenaltyRange;
        reg.LastUpdated = DateTime.Now;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật văn bản luật thành công." });
    }

    [HttpDelete("regulations/{id:int}")]
    public async Task<IActionResult> DeleteRegulation(int id)
    {
        var reg = await _db.Regulations.FindAsync(id);
        if (reg == null) return NotFound();

        _db.Regulations.Remove(reg);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa văn bản luật." });
    }

    // ════════════════════════════════════════════════════════════════════════
    // SESSIONS — Xem lịch sử thi
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.ExamSessions
            .Include(s => s.LicenseType)
            .Where(s => s.Status != "In-Progress")
            .OrderByDescending(s => s.StartTime);

        var total = await query.CountAsync();
        var sessions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SessionID,
                s.UserID,
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

    // ════════════════════════════════════════════════════════════════════════
    // SAMPLE EXAMS — Quản lý đề thi mẫu
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("sample-exams")]
    public async Task<IActionResult> GetSampleExams(
        [FromQuery] int? licenseTypeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.SampleExams
            .Include(s => s.LicenseType)
            .AsQueryable();

        if (licenseTypeId.HasValue)
            query = query.Where(s => s.LicenseTypeID == licenseTypeId);

        var total = await query.CountAsync();
        var data = await query
            .OrderBy(s => s.SampleExamID)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SampleExamID,
                s.ExamName,
                s.LicenseTypeID,
                LicenseTypeName = s.LicenseType != null ? s.LicenseType.TypeName : "",
                QuestionCount = _db.SampleExamDetails.Count(d => d.SampleExamID == s.SampleExamID)
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data });
    }

    [HttpGet("sample-exams/{id:int}/questions")]
    public async Task<IActionResult> GetSampleExamQuestions(int id)
    {
        var exam = await _db.SampleExams
            .Include(s => s.LicenseType)
            .FirstOrDefaultAsync(s => s.SampleExamID == id);

        if (exam == null) return NotFound();

        var questions = await _db.SampleExamDetails
            .Where(d => d.SampleExamID == id)
            .Include(d => d.Question)
            .ThenInclude(q => q!.Category)
            .Select(d => new
            {
                d.Question!.QuestionID,
                d.Question.Content,
                d.Question.IsCritical,
                CategoryName = d.Question.Category != null ? d.Question.Category.CategoryName : ""
            })
            .ToListAsync();

        return Ok(new
        {
            exam.SampleExamID,
            exam.ExamName,
            exam.LicenseTypeID,
            LicenseTypeName = exam.LicenseType?.TypeName ?? "",
            questions
        });
    }

    [HttpPost("sample-exams")]
    public async Task<IActionResult> CreateSampleExam([FromBody] SampleExamUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ExamName))
            return BadRequest(new { message = "Tên đề thi không được trống." });

        var exam = new SampleExam
        {
            ExamName = dto.ExamName.Trim(),
            LicenseTypeID = dto.LicenseTypeID
        };

        _db.SampleExams.Add(exam);
        await _db.SaveChangesAsync();

        if (dto.QuestionIDs?.Any() == true)
        {
            foreach (var qid in dto.QuestionIDs.Distinct())
            {
                _db.SampleExamDetails.Add(new SampleExamDetail
                {
                    SampleExamID = exam.SampleExamID,
                    QuestionID = qid
                });
            }
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Tạo đề thi thành công.", exam.SampleExamID });
    }

    [HttpPut("sample-exams/{id:int}")]
    public async Task<IActionResult> UpdateSampleExam(int id, [FromBody] SampleExamUpsertDto dto)
    {
        var exam = await _db.SampleExams
            .Include(s => s.SampleExamDetails)
            .FirstOrDefaultAsync(s => s.SampleExamID == id);

        if (exam == null) return NotFound();

        exam.ExamName = dto.ExamName.Trim();
        exam.LicenseTypeID = dto.LicenseTypeID;

        if (dto.QuestionIDs != null)
        {
            _db.SampleExamDetails.RemoveRange(exam.SampleExamDetails);
            foreach (var qid in dto.QuestionIDs.Distinct())
            {
                _db.SampleExamDetails.Add(new SampleExamDetail
                {
                    SampleExamID = id,
                    QuestionID = qid
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật đề thi thành công." });
    }

    [HttpDelete("sample-exams/{id:int}")]
    public async Task<IActionResult> DeleteSampleExam(int id)
    {
        var exam = await _db.SampleExams.FindAsync(id);
        if (exam == null) return NotFound();

        var details = await _db.SampleExamDetails
            .Where(d => d.SampleExamID == id)
            .ToListAsync();
        _db.SampleExamDetails.RemoveRange(details);
        _db.SampleExams.Remove(exam);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa đề thi." });
    }

    [HttpPost("sample-exams/{id:int}/add-question/{qid:int}")]
    public async Task<IActionResult> AddQuestionToSampleExam(int id, int qid)
    {
        if (await _db.SampleExamDetails.AnyAsync(d => d.SampleExamID == id && d.QuestionID == qid))
            return BadRequest(new { message = "Câu hỏi đã có trong đề thi." });

        _db.SampleExamDetails.Add(new SampleExamDetail
        {
            SampleExamID = id,
            QuestionID = qid
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã thêm câu hỏi vào đề thi." });
    }

    [HttpDelete("sample-exams/{id:int}/remove-question/{qid:int}")]
    public async Task<IActionResult> RemoveQuestionFromSampleExam(int id, int qid)
    {
        var detail = await _db.SampleExamDetails
            .FirstOrDefaultAsync(d => d.SampleExamID == id && d.QuestionID == qid);

        if (detail == null) return NotFound();

        _db.SampleExamDetails.Remove(detail);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa câu hỏi khỏi đề thi." });
    }

    // ════════════════════════════════════════════════════════════════════════
    // REPORTS — Báo cáo thống kê chi tiết
    // ════════════════════════════════════════════════════════════════════════

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports([FromQuery] int days = 30)
    {
        var since = DateTime.Now.AddDays(-days);

        // Tổng quan
        var totalExams = await _db.ExamSessions.CountAsync(s => s.Status != "In-Progress" && s.StartTime >= since);
        var passedExams = await _db.ExamSessions.CountAsync(s => s.Status == "Pass" && s.StartTime >= since);
        var failedExams = await _db.ExamSessions.CountAsync(s => s.Status == "Fail" && s.StartTime >= since);
        var newUsers = await _db.Users.CountAsync(u => u.CreatedAt >= since);
        var criticalFail = await _db.ExamSessions.CountAsync(s => s.HasCriticalError && s.StartTime >= since);

        // Theo ngày
        var daily = await _db.ExamSessions
            .Where(s => s.StartTime >= since && s.Status != "In-Progress")
            .GroupBy(s => s.StartTime.Date)
            .Select(g => new
            {
                date = g.Key,
                total = g.Count(),
                passed = g.Count(x => x.Status == "Pass"),
                failed = g.Count(x => x.Status == "Fail")
            })
            .OrderBy(g => g.date)
            .ToListAsync();

        // Theo hạng bằng
        var byLicense = await _db.ExamSessions
            .Where(s => s.StartTime >= since && s.Status != "In-Progress")
            .Include(s => s.LicenseType)
            .GroupBy(s => s.LicenseType != null ? s.LicenseType.TypeName : "N/A")
            .Select(g => new
            {
                license = g.Key,
                total = g.Count(),
                passed = g.Count(x => x.Status == "Pass"),
                passRate = g.Count() > 0 ? Math.Round((double)g.Count(x => x.Status == "Pass") / g.Count() * 100, 1) : 0
            })
            .OrderByDescending(g => g.total)
            .ToListAsync();

        // Top câu sai nhiều nhất
        var topWrong = await _db.WrongAnswerLogs
            .GroupBy(w => w.QuestionID)
            .Select(g => new { questionID = g.Key, errorCount = g.Sum(x => x.ErrorCount) })
            .OrderByDescending(g => g.errorCount)
            .Take(10)
            .Join(_db.Questions,
                w => w.questionID,
                q => q.QuestionID,
                (w, q) => new { q.QuestionID, q.Content, w.errorCount, q.IsCritical })
            .ToListAsync();

        // Điểm trung bình theo ngày
        var avgScores = await _db.ExamSessions
            .Where(s => s.StartTime >= since && s.Status != "In-Progress")
            .GroupBy(s => s.StartTime.Date)
            .Select(g => new { date = g.Key, avgScore = Math.Round(g.Average(x => (double)x.Score), 1) })
            .OrderBy(g => g.date)
            .ToListAsync();

        // User mới theo ngày
        var newUsersByDay = await _db.Users
            .Where(u => u.CreatedAt >= since)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new { date = g.Key, count = g.Count() })
            .OrderBy(g => g.date)
            .ToListAsync();

        return Ok(new
        {
            period = days,
            summary = new
            {
                totalExams,
                passedExams,
                failedExams,
                newUsers,
                criticalFail,
                passRate = totalExams > 0 ? Math.Round((double)passedExams / totalExams * 100, 1) : 0
            },
            daily,
            byLicense,
            topWrong,
            avgScores,
            newUsersByDay
        });
    }
}

// ════════════════════════════════════════════════════════════════════════
// DTOS
// ════════════════════════════════════════════════════════════════════════

public class QuestionUpsertDto
{
    public string Content { get; set; } = "";
    public string? ImageURL { get; set; }
    public string? Explanation { get; set; }
    public bool IsCritical { get; set; }
    public int CategoryID { get; set; }
    public List<int> LicenseTypeIDs { get; set; } = new();
    public List<AnswerUpsertDto> Answers { get; set; } = new();
}

public class AnswerUpsertDto
{
    public string AnswerText { get; set; } = "";
    public bool IsCorrect { get; set; }
}

public class TrafficSignUpsertDto
{
    public string SignCode { get; set; } = "";
    public string SignName { get; set; } = "";
    public string? SignType { get; set; }
    public string? ImageURL { get; set; }
    public string? Description { get; set; }
}

public class RegulationUpsertDto
{
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? PenaltyRange { get; set; }
}

public class SampleExamUpsertDto
{
    public string ExamName { get; set; } = "";
    public int LicenseTypeID { get; set; }
    public List<int>? QuestionIDs { get; set; }
}