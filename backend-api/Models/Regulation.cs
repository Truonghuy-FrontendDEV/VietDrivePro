namespace backend_api.Models;

public class Regulation
{
    public int RegulationID { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? PenaltyRange { get; set; }
    public DateTime LastUpdated { get; set; }
}
