namespace backend_api.Models;

public class User
{
    public int UserID { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string? AvatarURL { get; set; }
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsLocked { get; set; } = false;
}
