namespace backend_api.Models;

public class ExamBlueprint
{
    public int BlueprintID { get; set; }
    public int LicenseTypeID { get; set; }
    public int CategoryID { get; set; }
    public int QuestionCount { get; set; }

    public virtual LicenseType LicenseType { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
}