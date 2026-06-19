namespace backend_api.DTOs.Admin;

public class QuestionUpsertRequest
{
    public string Content { get; set; } = "";
    public string? ImageURL { get; set; }
    public string? Explanation { get; set; }
    public bool IsCritical { get; set; }
    public int CategoryID { get; set; }

    public List<int> LicenseTypeIDs { get; set; } = new();
    public List<AnswerUpsertItem> Answers { get; set; } = new();
}