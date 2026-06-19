namespace backend_api.DTOs.Admin;

public class RegulationUpsertRequest
{
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? PenaltyRange { get; set; }
}