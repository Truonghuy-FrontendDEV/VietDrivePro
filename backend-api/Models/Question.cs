namespace backend_api.Models;

public class Question
{
    internal object SampleExamDetails;

    public int QuestionID { get; set; }
    public string Content { get; set; } = "";
    public string? ImageURL { get; set; }
    public string? Explanation { get; set; }
    public bool IsCritical { get; set; }
    public int CategoryID { get; set; }
    public int? SignID { get; set; }
    public int? RegulationID { get; set; }

    public Category? Category { get; set; }
    public TrafficSign? TrafficSign { get; set; }
    public Regulation? Regulation { get; set; }
    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<QuestionLicenseMap> QuestionLicenseMaps { get; set; } = new List<QuestionLicenseMap>();
}
