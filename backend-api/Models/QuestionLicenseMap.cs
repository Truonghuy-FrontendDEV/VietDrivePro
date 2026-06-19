namespace backend_api.Models;

public class QuestionLicenseMap
{
    public int QuestionID { get; set; }
    public int LicenseTypeID { get; set; }
    public Question? Question { get; set; }
    public LicenseType? LicenseType { get; set; }
}