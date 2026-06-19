namespace backend_api.DTOs.Auth;

public record UpdateProfileRequest(string FullName, string? AvatarURL);