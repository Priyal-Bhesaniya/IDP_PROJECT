-- Database Migration Script for SQL Server
-- Add ServiceStatus column and remove unnecessary columns from Bookings table

USE AutoLoopDB;
GO

-- Step 1: Add ServiceStatus column with default value 'pending'
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'ServiceStatus' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    PRINT 'Adding ServiceStatus column...';
    ALTER TABLE dbo.Bookings 
    ADD ServiceStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_Bookings_ServiceStatus DEFAULT 'pending';
    
    -- Update existing records to have 'pending' as service status
    UPDATE dbo.Bookings 
    SET ServiceStatus = 'pending' 
    WHERE ServiceStatus IS NULL OR ServiceStatus = '';
    
    PRINT 'ServiceStatus column added successfully.';
END
ELSE
BEGIN
    PRINT 'ServiceStatus column already exists.';
END
GO

-- Step 2: Remove unnecessary columns
PRINT 'Removing unnecessary columns...';

-- Remove CarColor column
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CarColor' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    ALTER TABLE dbo.Bookings DROP COLUMN CarColor;
    PRINT 'CarColor column removed.';
END

-- Remove AdditionalNotes column  
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'AdditionalNotes' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    ALTER TABLE dbo.Bookings DROP COLUMN AdditionalNotes;
    PRINT 'AdditionalNotes column removed.';
END

-- Remove CardName column
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CardName' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    ALTER TABLE dbo.Bookings DROP COLUMN CardName;
    PRINT 'CardName column removed.';
END

-- Remove CardLast4Digits column
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CardLast4Digits' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    ALTER TABLE dbo.Bookings DROP COLUMN CardLast4Digits;
    PRINT 'CardLast4Digits column removed.';
END

-- Remove UpiId column
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'UpiId' AND Object_ID = Object_ID(N'dbo.Bookings'))
BEGIN
    ALTER TABLE dbo.Bookings DROP COLUMN UpiId;
    PRINT 'UpiId column removed.';
END

GO

-- Step 3: Verify the changes
PRINT 'Verifying changes...';

-- Show the updated table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Bookings' 
ORDER BY ORDINAL_POSITION;

-- Show sample data to verify ServiceStatus column
SELECT TOP 5 
    Id, 
    UserMobile, 
    ServiceStatus, 
    BookingStatus, 
    PaymentStatus, 
    CarNumber, 
    CarModel 
FROM dbo.Bookings;

GO

PRINT 'Migration completed successfully!';
PRINT 'Changes made:';
PRINT '- Added ServiceStatus column with default value "pending"';
PRINT '- Removed columns: CarColor, AdditionalNotes, CardName, CardLast4Digits, UpiId';
GO
