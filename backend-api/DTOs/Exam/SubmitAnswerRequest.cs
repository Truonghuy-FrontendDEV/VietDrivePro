namespace backend_api.DTOs.Exam;

public record SubmitAnswerRequest(int SessionID, int QuestionID, int AnswerID);