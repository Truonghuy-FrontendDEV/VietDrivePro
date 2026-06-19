using System.ComponentModel.DataAnnotations.Schema;

namespace backend_api.Models;

public class ExamSession
{
    [Column("SessionID")]
    public int SessionID { get; set; }

    [Column("UserID")]
    public int UserID { get; set; }

    [Column("LicenseTypeID")]
    public int LicenseTypeID { get; set; }

    [Column("StartTime")]
    public DateTime StartTime { get; set; }

    [Column("EndTime")]
    public DateTime? EndTime { get; set; }

    [Column("Score")]
    public int Score { get; set; }

    [Column("HasCriticalError")]
    public bool HasCriticalError { get; set; }

    [Column("Status")]
    public string Status { get; set; } = "In-Progress";

    public LicenseType? LicenseType { get; set; }
    public ICollection<SessionDetail> SessionDetails { get; set; } = new List<SessionDetail>();
}