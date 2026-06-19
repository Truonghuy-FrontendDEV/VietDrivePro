CREATE DATABASE VietDriveProDB;
GO
USE VietDriveProDB;
GO

-- 1. Quản lý Hạng Bằng
CREATE TABLE LicenseTypes (
    LicenseTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName VARCHAR(10) NOT NULL,
    TimeLimit INT NOT NULL,
    TotalQuestions INT NOT NULL,
    PassingScore INT NOT NULL,
    Description NVARCHAR(500)
);

-- 2. Quản lý Người dùng
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(256) NOT NULL,
    AvatarURL VARCHAR(255),
    Role NVARCHAR(20) DEFAULT 'User',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Danh mục Chủ đề
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    IconURL VARCHAR(255)
);

-- 4. Bảng Luật Giao Thông
CREATE TABLE Regulations (
    RegulationID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    PenaltyRange NVARCHAR(255),
    LastUpdated DATETIME DEFAULT GETDATE()
);

-- 5. Bảng Biển báo
CREATE TABLE TrafficSigns (
    SignID INT PRIMARY KEY IDENTITY(1,1),
    SignCode VARCHAR(20) NOT NULL,
    SignName NVARCHAR(255) NOT NULL,
    SignType NVARCHAR(50),
    ImageURL VARCHAR(255),
    Description NVARCHAR(MAX)
);

-- 6. Bảng Câu hỏi
CREATE TABLE Questions (
    QuestionID INT PRIMARY KEY IDENTITY(1,1),
    Content NVARCHAR(MAX) NOT NULL,
    ImageURL VARCHAR(255) NULL,
    Explanation NVARCHAR(MAX),
    IsCritical BIT DEFAULT 0,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    SignID INT NULL FOREIGN KEY REFERENCES TrafficSigns(SignID),
    RegulationID INT NULL FOREIGN KEY REFERENCES Regulations(RegulationID)
);

-- 7. Bảng Đáp án
CREATE TABLE Answers (
    AnswerID INT PRIMARY KEY IDENTITY(1,1),
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID) ON DELETE CASCADE,
    AnswerText NVARCHAR(MAX) NOT NULL,
    IsCorrect BIT DEFAULT 0
);

-- 8. Quản lý Đề thi mẫu
CREATE TABLE SampleExams (
    SampleExamID INT PRIMARY KEY IDENTITY(1,1),
    ExamName NVARCHAR(100),
    LicenseTypeID INT FOREIGN KEY REFERENCES LicenseTypes(LicenseTypeID)
);

CREATE TABLE SampleExamDetails (
    SampleExamID INT FOREIGN KEY REFERENCES SampleExams(SampleExamID),
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID),
    PRIMARY KEY (SampleExamID, QuestionID)
);

-- 9. Bảng Quy định cấu trúc đề
CREATE TABLE ExamBlueprints (
    BlueprintID INT PRIMARY KEY IDENTITY(1,1),
    LicenseTypeID INT FOREIGN KEY REFERENCES LicenseTypes(LicenseTypeID),
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    QuestionCount INT NOT NULL
);

-- 10. Lượt thi
CREATE TABLE ExamSessions (
    SessionID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    LicenseTypeID INT FOREIGN KEY REFERENCES LicenseTypes(LicenseTypeID),
    StartTime DATETIME DEFAULT GETDATE(),
    EndTime DATETIME,
    Score INT DEFAULT 0,
    HasCriticalError BIT DEFAULT 0,
    Status NVARCHAR(20) DEFAULT 'In-Progress'
);

-- 11. Chi tiết trả lời
CREATE TABLE SessionDetails (
    DetailID INT PRIMARY KEY IDENTITY(1,1),
    SessionID INT FOREIGN KEY REFERENCES ExamSessions(SessionID),
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID),
    SelectedAnswerID INT FOREIGN KEY REFERENCES Answers(AnswerID),
    IsCorrect BIT
);

-- 12. Log câu sai
CREATE TABLE WrongAnswerLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID),
    LastAttempted DATETIME DEFAULT GETDATE(),
    ErrorCount INT DEFAULT 1,
    CONSTRAINT UC_User_Question UNIQUE (UserID, QuestionID)
);

-- 13. Bảng trung gian
CREATE TABLE QuestionLicenseMap (
    QuestionID INT FOREIGN KEY REFERENCES Questions(QuestionID),
    LicenseTypeID INT FOREIGN KEY REFERENCES LicenseTypes(LicenseTypeID),
    PRIMARY KEY (QuestionID, LicenseTypeID)
);

-- Ràng buộc bổ sung
ALTER TABLE ExamBlueprints 
ADD CONSTRAINT UC_License_Category UNIQUE (LicenseTypeID, CategoryID);

-- Indexes
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_TrafficSigns_Code ON TrafficSigns(SignCode);
CREATE INDEX IX_Questions_IsCritical ON Questions(IsCritical);
CREATE INDEX IX_Questions_Category ON Questions(CategoryID);
CREATE INDEX IX_ExamSessions_User ON ExamSessions(UserID);
CREATE INDEX IX_ExamSessions_Status ON ExamSessions(Status);
CREATE INDEX IX_SessionDetails_Session ON SessionDetails(SessionID);
CREATE INDEX IX_WrongAnswerLogs_User ON WrongAnswerLogs(UserID);

GO

-- Trigger 1: Kiểm tra câu điểm liệt
CREATE TRIGGER trg_CheckCriticalError
ON SessionDetails
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE es
    SET 
        HasCriticalError = 1,
        Status = 'Fail',
        EndTime = GETDATE()
    FROM ExamSessions es
    INNER JOIN (
        SELECT DISTINCT i.SessionID
        FROM inserted i
        INNER JOIN Questions q ON i.QuestionID = q.QuestionID
        WHERE i.IsCorrect = 0 AND q.IsCritical = 1
    ) AS failed ON es.SessionID = failed.SessionID
    WHERE es.Status = 'In-Progress';
END;
GO

-- Trigger 2: Ghi log câu sai (dùng IF EXISTS thay vì MERGE cho SQL 2014)
CREATE TRIGGER trg_LogWrongAnswers
ON SessionDetails
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT, @QuestionID INT;
    
    DECLARE cur CURSOR FOR
        SELECT DISTINCT es.UserID, i.QuestionID
        FROM inserted i
        INNER JOIN ExamSessions es ON i.SessionID = es.SessionID
        WHERE i.IsCorrect = 0 
        AND es.Status IN ('Pass', 'Fail');
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @UserID, @QuestionID;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF EXISTS (SELECT 1 FROM WrongAnswerLogs WHERE UserID = @UserID AND QuestionID = @QuestionID)
        BEGIN
            UPDATE WrongAnswerLogs
            SET ErrorCount = ErrorCount + 1,
                LastAttempted = GETDATE()
            WHERE UserID = @UserID AND QuestionID = @QuestionID;
        END
        ELSE
        BEGIN
            INSERT INTO WrongAnswerLogs (UserID, QuestionID, LastAttempted, ErrorCount)
            VALUES (@UserID, @QuestionID, GETDATE(), 1);
        END
        
        FETCH NEXT FROM cur INTO @UserID, @QuestionID;
    END
    
    CLOSE cur;
    DEALLOCATE cur;
END;
GO

-- Trigger 3: Cập nhật điểm số
CREATE TRIGGER trg_UpdateExamResult
ON SessionDetails
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE es
    SET 
        Score = (
            SELECT COUNT(*) 
            FROM SessionDetails sd 
            WHERE sd.SessionID = es.SessionID 
            AND sd.IsCorrect = 1
        ),
        Status = CASE 
            WHEN es.HasCriticalError = 1 THEN 'Fail'
            WHEN DATEDIFF(SECOND, es.StartTime, GETDATE()) >= lt.TimeLimit THEN 'Fail'
            WHEN es.EndTime IS NOT NULL THEN
                CASE 
                    WHEN (
                        SELECT COUNT(*) 
                        FROM SessionDetails sd 
                        WHERE sd.SessionID = es.SessionID 
                        AND sd.IsCorrect = 1
                    ) >= lt.PassingScore THEN 'Pass'
                    ELSE 'Fail'
                END
            ELSE 'In-Progress'
        END
    FROM ExamSessions es
    INNER JOIN LicenseTypes lt ON es.LicenseTypeID = lt.LicenseTypeID
    WHERE es.SessionID IN (SELECT DISTINCT SessionID FROM inserted)
    AND es.Status = 'In-Progress';
END;
GO

PRINT N'Tạo database VietDriveProDB thành công cho SQL Server 2014!';
GO