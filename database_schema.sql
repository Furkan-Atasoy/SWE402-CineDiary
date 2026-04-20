-- CineDiary Database Schema
-- Microsoft SQL Server (MSSQL)

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CineDiary')
BEGIN
    CREATE DATABASE CineDiary;
END
GO

USE CineDiary;
GO

-- 1. Users Table
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(20) DEFAULT 'User', -- 'User' or 'Admin'
    IsBanned BIT DEFAULT 0,
    BannedUntil DATETIME NULL,
    ViolationCount INT NOT NULL DEFAULT 0,
    BanCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 2. Movies Table (Normalized Database)
CREATE TABLE Movies (
    MovieID INT PRIMARY KEY IDENTITY(1,1),
    TitleNormalized NVARCHAR(255) UNIQUE NOT NULL, 
    ReviewCount INT DEFAULT 0,
    LastReviewAt DATETIME DEFAULT GETDATE()
);

-- 3. Reviews Table
CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    MovieID INT FOREIGN KEY REFERENCES Movies(MovieID),
    Rating INT CHECK (Rating >= 1 AND Rating <= 10),
    Comment NVARCHAR(MAX),
    Visibility NVARCHAR(10) DEFAULT 'Public', -- 'Public' or 'Private'
    Status NVARCHAR(20) DEFAULT 'Published', -- 'Published', 'Blocked'
    LikeCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 4. ReviewLikes Table (Social Features)
CREATE TABLE ReviewLikes (
    LikeID INT PRIMARY KEY IDENTITY(1,1),
    ReviewID INT NOT NULL FOREIGN KEY REFERENCES Reviews(ReviewID) ON DELETE CASCADE,
    UserID   INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_ReviewLike UNIQUE (ReviewID, UserID)
);

-- 5. BlockedReviewsLogs Table (For Admin Panel)
CREATE TABLE BlockedReviewsLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    ReviewID INT FOREIGN KEY REFERENCES Reviews(ReviewID) ON DELETE CASCADE,
    ReviewerID INT FOREIGN KEY REFERENCES Users(UserID),
    OriginalComment NVARCHAR(MAX),
    DetectedAt DATETIME DEFAULT GETDATE(),
    AdminAction NVARCHAR(20) DEFAULT 'Pending' -- 'Pending', 'Approved', 'Deleted'
);

GO

