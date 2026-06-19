using System.ComponentModel.DataAnnotations.Schema;

namespace backend_api.Models;

public class WrongAnswerLog
{
    [Column("LogID")]
    public int LogID { get; set; }

    [Column("UserID")]
    public int UserID { get; set; }

    [Column("QuestionID")]
    public int QuestionID { get; set; }

    [Column("LastAttempted")]
    public DateTime LastAttempted { get; set; }

    [Column("ErrorCount")]
    public int ErrorCount { get; set; }

    [Column("SessionID")]  // ← THÊM DÒNG NÀY
    public int SessionID { get; set; }  // ← ĐỔI internal set thành set

    public Question? Question { get; set; }
}