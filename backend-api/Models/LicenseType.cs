namespace backend_api.Models;

public class LicenseType
{
    public int LicenseTypeID { get; set; }
    public string TypeName { get; set; } = "";
    public int TimeLimit { get; set; }
    public int TotalQuestions { get; set; }
    public int PassingScore { get; set; }
    public string? Description { get; set; }
}
