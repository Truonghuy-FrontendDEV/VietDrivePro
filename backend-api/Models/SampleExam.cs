namespace backend_api.Models;

public class SampleExam
{
    public int SampleExamID { get; set; }
    public string? ExamName { get; set; }
    public int LicenseTypeID { get; set; }
    public LicenseType? LicenseType { get; set; }
    public ICollection<SampleExamDetail> SampleExamDetails { get; set; } = new List<SampleExamDetail>();
    public int SessionID { get; internal set; }
}

public class SampleExamDetail
{
    public int SampleExamID { get; set; }
    public int QuestionID { get; set; }
    public SampleExam? SampleExam { get; set; }
    public Question? Question { get; set; }
}