-- Add ServiceStatus column to Bookings table
USE AutoLoopDB;
GO

-- Add ServiceStatus column with default value 'pending'
ALTER TABLE dbo.Bookings 
ADD ServiceStatus NVARCHAR(20) NOT NULL DEFAULT 'pending';
GO

-- Update any existing records to ensure they have 'pending' as service status
UPDATE dbo.Bookings 
SET ServiceStatus = 'pending' 
WHERE ServiceStatus IS NULL OR ServiceStatus = '';
GO

-- Verify the column was added successfully
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'ServiceStatus';
GO

-- Show sample data
SELECT TOP 5 Id, UserMobile, ServiceStatus, BookingStatus, PaymentStatus, CarNumber, CarModel 
FROM dbo.Bookings;
GO

PRINT 'ServiceStatus column added successfully!';
GO
