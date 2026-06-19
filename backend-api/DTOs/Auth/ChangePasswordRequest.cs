namespace backend_api.DTOs.Auth;

public record ChangePasswordRequest(string OldPassword, string NewPassword);