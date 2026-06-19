using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend_api.Data;
using backend_api.Models;

namespace backend_api.Controllers;

[ApiController]
[Route("api/question-bank")]
[Authorize]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuestionsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/questions
    [HttpGet]
    public async Task<IActionResult> GetAllQuestions(
        [FromQuery] int? licenseTypeId,
        [FromQuery] int? categoryId,
        [FromQuery] bool? isCritical,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.Category)
            .AsQueryable();

        if (licenseTypeId.HasValue)
        {
            query = query.Where(q => q.QuestionLicenseMaps.Any(m => m.LicenseTypeID == licenseTypeId));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(q => q.CategoryID == categoryId);
        }

        if (isCritical.HasValue)
        {
            query = query.Where(q => q.IsCritical == isCritical.Value);
        }

        var totalCount = await query.CountAsync();
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
                CategoryName = q.Category != null ? q.Category.CategoryName : null,
                TotalAnswers = q.Answers.Count,
                CorrectAnswer = q.Answers
                .Where(a => a.IsCorrect)
                .Select(a => a.AnswerText)
                .FirstOrDefault() ?? "",
                LicenseTypes = q.QuestionLicenseMaps.Select(m => m.LicenseTypeID).ToList()
            })
            .ToListAsync();

        return Ok(new
        {
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            questions
        });
    }

    // GET: api/questions/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetQuestionById(int id)
    {
        var question = await _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.Category)
            .Include(q => q.TrafficSign)
            .Include(q => q.Regulation)
            .Include(q => q.QuestionLicenseMaps)
            .FirstOrDefaultAsync(q => q.QuestionID == id);

        if (question == null)
            return NotFound(new { message = "Không tìm thấy câu hỏi." });

        return Ok(new
        {
            question.QuestionID,
            question.Content,
            question.ImageURL,
            question.Explanation,
            question.IsCritical,
            question.CategoryID,
            CategoryName = question.Category?.CategoryName,
            question.SignID,
            SignCode = question.TrafficSign?.SignCode,
            SignName = question.TrafficSign?.SignName,
            question.RegulationID,
            RegulationTitle = question.Regulation?.Title,
            LicenseTypeIDs = question.QuestionLicenseMaps.Select(m => m.LicenseTypeID).ToList(),
            Answers = question.Answers.Select(a => new
            {
                a.AnswerID,
                a.AnswerText,
                a.IsCorrect
            }).OrderBy(a => a.AnswerID)
        });
    }

    // GET: api/questions/random
    [HttpGet("random")]
    public async Task<IActionResult> GetRandomQuestions([FromQuery] int count = 10, [FromQuery] int? licenseTypeId = null)
    {
        var query = _db.Questions.Include(q => q.Answers).AsQueryable();

        if (licenseTypeId.HasValue)
        {
            query = query.Where(q => q.QuestionLicenseMaps.Any(m => m.LicenseTypeID == licenseTypeId));
        }

        var totalCount = await query.CountAsync();
        var randomCount = Math.Min(count, totalCount);

        var questions = await query
            .OrderBy(_ => Guid.NewGuid())
            .Take(randomCount)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                q.Explanation,
                q.IsCritical,
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new
        {
            totalQuestions = randomCount,
            questions
        });
    }

    // GET: api/questions/by-sign/{signId}
    [HttpGet("by-sign/{signId}")]
    public async Task<IActionResult> GetQuestionsBySign(int signId)
    {
        var sign = await _db.TrafficSigns.FindAsync(signId);
        if (sign == null)
            return NotFound(new { message = "Không tìm thấy biển báo." });

        var questions = await _db.Questions
            .Where(q => q.SignID == signId)
            .Include(q => q.Answers)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                q.Explanation,
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new
        {
            sign.SignCode,
            sign.SignName,
            totalQuestions = questions.Count,
            questions
        });
    }

    // GET: api/questions/by-regulation/{regulationId}
    [HttpGet("by-regulation/{regulationId}")]
    public async Task<IActionResult> GetQuestionsByRegulation(int regulationId)
    {
        var regulation = await _db.Regulations.FindAsync(regulationId);
        if (regulation == null)
            return NotFound(new { message = "Không tìm thấy quy định." });

        var questions = await _db.Questions
            .Where(q => q.RegulationID == regulationId)
            .Include(q => q.Answers)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new
        {
            regulation.Title,
            totalQuestions = questions.Count,
            questions
        });
    }

    // GET: api/questions/by-category/{categoryId}
    [HttpGet("by-category/{categoryId}")]
    public async Task<IActionResult> GetQuestionsByCategory(int categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var category = await _db.Categories.FindAsync(categoryId);
        if (category == null)
            return NotFound(new { message = "Không tìm thấy chương." });

        var query = _db.Questions
            .Where(q => q.CategoryID == categoryId)
            .Include(q => q.Answers);

        var totalCount = await query.CountAsync();
        var questions = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                q.Explanation,
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new
        {
            category.CategoryName,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            questions
        });
    }

    // GET: api/questions/critical
    [HttpGet("critical")]
    public async Task<IActionResult> GetCriticalQuestions([FromQuery] int? licenseTypeId = null)
    {
        var query = _db.Questions
            .Where(q => q.IsCritical == true)
            .Include(q => q.Answers)
            .AsQueryable();

        if (licenseTypeId.HasValue)
        {
            query = query.Where(q => q.QuestionLicenseMaps.Any(m => m.LicenseTypeID == licenseTypeId));
        }

        var questions = await query
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL,
                q.Explanation,
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new
        {
            totalCount = questions.Count,
            questions
        });
    }

    // POST: api/questions/check-answers
    [HttpPost("check-answers")]
    public async Task<IActionResult> CheckAnswers([FromBody] CheckAnswersDto dto)
    {
        var results = new List<AnswerCheckResult>();

        foreach (var item in dto.Answers)
        {
            var question = await _db.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.QuestionID == item.QuestionId);

            if (question != null)
            {
                var selectedAnswer = question.Answers.FirstOrDefault(a => a.AnswerID == item.SelectedAnswerId);
                var isCorrect = selectedAnswer != null && selectedAnswer.IsCorrect;

                results.Add(new AnswerCheckResult
                {
                    QuestionId = item.QuestionId,
                    IsCorrect = isCorrect,
                    CorrectAnswerId = question.Answers.FirstOrDefault(a => a.IsCorrect)?.AnswerID ?? 0,
                    CorrectAnswerText = question.Answers.FirstOrDefault(a => a.IsCorrect)?.AnswerText ?? "",
                    Explanation = question.Explanation
                });
            }
        }

        var score = results.Count(r => r.IsCorrect);
        var total = results.Count;
        var percentage = total > 0 ? (int)Math.Round((double)score / total * 100) : 0;

        return Ok(new
        {
            score,
            total,
            percentage,
            results
        });
    }

    // GET: api/questions/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetQuestionsStats()
    {
        var totalQuestions = await _db.Questions.CountAsync();
        var totalCritical = await _db.Questions.CountAsync(q => q.IsCritical == true);
        var totalWithImages = await _db.Questions.CountAsync(q => q.ImageURL != null);
        var totalWithExplanation = await _db.Questions.CountAsync(q => q.Explanation != null);

        var statsByCategory = await _db.Questions
            .GroupBy(q => q.CategoryID)
            .Select(g => new
            {
                CategoryId = g.Key,
                CategoryName = _db.Categories.Where(c => c.CategoryID == g.Key).Select(c => c.CategoryName).FirstOrDefault(),
                Total = g.Count(),
                Critical = g.Count(q => q.IsCritical == true)
            })
            .ToListAsync();

        var statsByLicense = await _db.QuestionLicenseMaps
            .GroupBy(m => m.LicenseTypeID)
            .Select(g => new
            {
                LicenseTypeId = g.Key,
                LicenseTypeName = _db.LicenseTypes.Where(l => l.LicenseTypeID == g.Key).Select(l => l.TypeName).FirstOrDefault(),
                Total = g.Count()
            })
            .ToListAsync();

        return Ok(new
        {
            totalQuestions,
            totalCritical,
            totalWithImages,
            totalWithExplanation,
            statsByCategory,
            statsByLicense
        });

    }



    [HttpGet("categories")]
    [AllowAnonymous] // Cho phép lấy danh sách chương để hiển thị ở trang Admin
    public async Task<IActionResult> GetCategories()
    {
        var cats = await _db.Categories.OrderBy(c => c.CategoryID).ToListAsync();
        return Ok(cats);
    }



    // DTOs
    public class CheckAnswersDto
    {
        public List<UserAnswerDto> Answers { get; set; } = new();
    }

    public class UserAnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedAnswerId { get; set; }
    }

    public class AnswerCheckResult
    {
        public int QuestionId { get; set; }
        public bool IsCorrect { get; set; }
        public int CorrectAnswerId { get; set; }
        public string CorrectAnswerText { get; set; } = "";
        public string? Explanation { get; set; }
    }
}