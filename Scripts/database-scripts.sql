-- Create AutoLoopDB Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AutoLoopDB')
BEGIN
    CREATE DATABASE AutoLoopDB;
END
GO

USE AutoLoopDB;
GO

-- Create Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MobileNumber NVARCHAR(10) UNIQUE NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create OTP Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OTPRequests]') AND type in (N'U'))
BEGIN
    CREATE TABLE OTPRequests (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MobileNumber NVARCHAR(10) NOT NULL,
        OTP NVARCHAR(6) NOT NULL,
        Attempts INT DEFAULT 0,
        IsUsed BIT DEFAULT 0,
        ExpiryTime DATETIME NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create LoginAttempts Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginAttempts]') AND type in (N'U'))
BEGIN
    CREATE TABLE LoginAttempts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MobileNumber NVARCHAR(10) NOT NULL,
        AttemptCount INT DEFAULT 1,
        IsLocked BIT DEFAULT 0,
        LockEndTime DATETIME NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Insert sample user
IF NOT EXISTS (SELECT * FROM Users WHERE MobileNumber = '1234567890')
BEGIN
    INSERT INTO Users (MobileNumber) VALUES ('1234567890');
END
GO

PRINT 'Database tables created successfully!';
