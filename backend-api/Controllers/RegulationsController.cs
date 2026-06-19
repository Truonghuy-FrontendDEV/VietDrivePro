using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend_api.Data;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegulationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RegulationsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/regulations
    [HttpGet]
    public async Task<IActionResult> GetAllRegulations(
        [FromQuery] string? keyword,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Regulations.AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(r => r.Title.Contains(keyword) || r.Content.Contains(keyword));
        }

        var totalCount = await query.CountAsync();
        var regulations = await query
            .OrderByDescending(r => r.LastUpdated)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.RegulationID,
                r.Title,
                r.PenaltyRange,
                r.LastUpdated,
                Summary = r.Content.Length > 200 ? r.Content.Substring(0, 200) + "..." : r.Content
            })
            .ToListAsync();

        return Ok(new
        {
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            regulations
        });
    }

    // GET: api/regulations/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRegulationById(int id)
    {
        var regulation = await _db.Regulations.FindAsync(id);

        if (regulation == null)
            return NotFound(new { message = "Không tìm thấy quy định." });

        var relatedQuestions = await _db.Questions
            .Where(q => q.RegulationID == id)
            .Take(5)
            .Select(q => new
            {
                q.QuestionID,
                q.Content,
                q.ImageURL
            })
            .ToListAsync();

        return Ok(new
        {
            regulation.RegulationID,
            regulation.Title,
            regulation.Content,
            regulation.PenaltyRange,
            regulation.LastUpdated,
            relatedQuestions
        });
    }

    // GET: api/regulations/search
    [HttpGet("search")]
    public async Task<IActionResult> SearchRegulations([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return BadRequest(new { message = "Vui lòng nhập từ khóa tìm kiếm." });

        var regulations = await _db.Regulations
            .Where(r => r.Title.Contains(keyword) || r.Content.Contains(keyword))
            .Take(20)
            .Select(r => new
            {
                r.RegulationID,
                r.Title,
                r.PenaltyRange,
                r.LastUpdated
            })
            .ToListAsync();

        return Ok(regulations);
    }
}