using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend_api.Data;

namespace backend_api.Controllers;

[ApiController]
[Route("api/trafficSigns")]
[Authorize]
public class TrafficSignsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TrafficSignsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/trafficsigns
    [HttpGet]
    public async Task<IActionResult> GetAllSigns(
        [FromQuery] string? signType,
        [FromQuery] string? keyword,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.TrafficSigns.AsQueryable();

        if (!string.IsNullOrEmpty(signType))
        {
            query = query.Where(s => s.SignType == signType);
        }

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(s => s.SignName.Contains(keyword) || s.SignCode.Contains(keyword));
        }

        var totalCount = await query.CountAsync();
        var signs = await query
            .OrderBy(s => s.SignCode)
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

        return Ok(new
        {
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            signs
        });
    }

    // GET: api/trafficsigns/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSignById(int id)
    {
        var sign = await _db.TrafficSigns.FindAsync(id);

        if (sign == null)
            return NotFound(new { message = "Không tìm thấy biển báo." });

        // Lấy danh sách câu hỏi liên quan đến biển báo này
        var relatedQuestions = await _db.Questions
            .Where(q => q.SignID == id)
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
            sign.SignID,
            sign.SignCode,
            sign.SignName,
            sign.SignType,
            sign.ImageURL,
            sign.Description,
            relatedQuestions
        });
    }

    // GET: api/trafficsigns/types
    [HttpGet("types")]
    public async Task<IActionResult> GetSignTypes()
    {
        var signTypes = await _db.TrafficSigns
            .Where(s => s.SignType != null)
            .Select(s => s.SignType)
            .Distinct()
            .ToListAsync();

        return Ok(signTypes);
    }
}