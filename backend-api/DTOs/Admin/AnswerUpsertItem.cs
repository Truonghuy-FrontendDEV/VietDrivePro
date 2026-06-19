namespace backend_api.DTOs.Admin;

public class AnswerUpsertItem
{
    public string AnswerText { get; set; } = "";
    public bool IsCorrect { get; set; }
}