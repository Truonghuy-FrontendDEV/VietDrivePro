using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend_api.Data;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionBankController : ControllerBase
{
    private readonly AppDbContext _db;
    public QuestionBankController(AppDbContext db) => _db = db;

    // GET /api/questionbank?licenseTypeId=1&categoryId=2&page=1&pageSize=20&search=...
    [HttpGet]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] int? licenseTypeId,
        [FromQuery] int? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.Category)
            .Include(q => q.QuestionLicenseMaps)
            .AsQueryable();

        // Lọc theo hạng bằng
        if (licenseTypeId.HasValue)
            query = query.Where(q => q.QuestionLicenseMaps.Any(m => m.LicenseTypeID == licenseTypeId));

        // Lọc theo chương/chủ đề
        if (categoryId.HasValue)
            query = query.Where(q => q.CategoryID == categoryId);

        // Tìm kiếm
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
                Answers = q.Answers.Select(a => new
                {
                    a.AnswerID,
                    a.AnswerText,
                    a.IsCorrect
                })
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = questions });
    }

    // GET /api/questionbank/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await _db.Categories.OrderBy(c => c.CategoryID).ToListAsync();
        return Ok(cats);
    }

    // GET /api/questionbank/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var q = await _db.Questions
            .Include(q => q.Answers)
            .Include(q => q.Category)
            .FirstOrDefaultAsync(q => q.QuestionID == id);

        if (q == null) return NotFound();

        return Ok(new
        {
            q.QuestionID,
            q.Content,
            q.ImageURL,
            q.Explanation,
            q.IsCritical,
            q.CategoryID,
            CategoryName = q.Category?.CategoryName,
            Answers = q.Answers.Select(a => new { a.AnswerID, a.AnswerText, a.IsCorrect })
        });
    }
}
