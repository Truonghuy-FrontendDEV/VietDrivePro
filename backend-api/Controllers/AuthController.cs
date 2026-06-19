using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend_api.Data;
using backend_api.Models;
using backend_api.DTOs.Auth;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin." });

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email đã được sử dụng." });

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đăng ký thành công! Vui lòng đăng nhập." });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });

        if (user.IsLocked)
            return Unauthorized(new { message = "Tài khoản đã bị khóa. Vui lòng liên hệ admin." });

        var token = GenerateJwtToken(user);
        return Ok(new
        {
            token,
            user = new
            {
                user.UserID,
                user.FullName,
                user.Email,
                user.Role,
                user.AvatarURL
            }
        });
    }

    // GET /api/auth/me  — lấy thông tin user hiện tại từ token
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new
        {
            user.UserID,
            user.FullName,
            user.Email,
            user.Role,
            user.AvatarURL,
            user.CreatedAt
        });
    }

    // PUT /api/auth/change-password
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
            return BadRequest(new { message = "Mật khẩu cũ không đúng." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đổi mật khẩu thành công." });
    }

    // PUT /api/auth/update-profile
    [HttpPut("update-profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.FullName = dto.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(dto.AvatarURL))
            user.AvatarURL = dto.AvatarURL;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công.", user.FullName, user.AvatarURL });
    }

    // ─── Helper ──────────────────────────────────────────────────────────────
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(int.Parse(_config["Jwt:ExpiresInDays"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record ChangePasswordDto(string OldPassword, string NewPassword);
public record UpdateProfileDto(string FullName, string? AvatarURL);
