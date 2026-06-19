namespace backend_api.DTOs.Exam;

public record StartExamRequest(int LicenseTypeID, string Mode, int? SampleExamID);