using System.ComponentModel.DataAnnotations.Schema;

namespace backend_api.Models;

public class SessionDetail
{
    [Column("DETAILID")]
    public int DetailID { get; set; }

    [Column("SessionID")]
    public int SessionID { get; set; }

    [Column("QuestionID")]
    public int QuestionID { get; set; }

    [Column("SelectedAnswerID")]
    public int? SelectedAnswerID { get; set; }

    [Column("IsCorrect")]
    public bool? IsCorrect { get; set; }

    public Question? Question { get; set; }
    public virtual Answer? SelectedAnswer { get; set; }
}