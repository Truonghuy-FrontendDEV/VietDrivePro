using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_api.Data;

namespace backend_api.Controllers;

[ApiController]
[Route("api/license-types")]
public class LicenseTypesController : ControllerBase
{
    private readonly AppDbContext _db;
    public LicenseTypesController(AppDbContext db) => _db = db;

    // GET /api/licensetypes
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _db.LicenseTypes
            .OrderBy(l => l.TypeName)
            .ToListAsync();
        return Ok(types);
    }

    // GET /api/licensetypes/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lt = await _db.LicenseTypes.FindAsync(id);
        if (lt == null) return NotFound();
        return Ok(lt);
    }
}
