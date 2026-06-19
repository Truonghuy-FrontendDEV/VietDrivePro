namespace backend_api.Models;

public class TrafficSign
{
    public int SignID { get; set; }
    public string SignCode { get; set; } = "";
    public string SignName { get; set; } = "";
    public string? SignType { get; set; }
    public string? ImageURL { get; set; }
    public string? Description { get; set; }
}
