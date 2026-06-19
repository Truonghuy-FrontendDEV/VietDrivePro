namespace backend_api.DTOs.Admin;

public class SignUpsertRequest
{
    public string SignCode { get; set; } = "";
    public string SignName { get; set; } = "";
    public string? SignType { get; set; }
    public string? ImageURL { get; set; }
    public string? Description { get; set; }
}