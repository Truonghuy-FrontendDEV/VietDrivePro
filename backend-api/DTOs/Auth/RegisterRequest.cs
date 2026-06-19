namespace backend_api.DTOs.Auth;

public record RegisterRequest(string FullName, string Email, string Password);