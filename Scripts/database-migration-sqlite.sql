-- Database Migration Script for SQLite
-- Add ServiceStatus column and remove unnecessary columns from Bookings table

-- Step 1: Add ServiceStatus column with default value 'pending'
ALTER TABLE Bookings 
ADD COLUMN ServiceStatus TEXT NOT NULL DEFAULT 'pending';

-- Step 2: Update existing records to have 'pending' as service status (in case default didn't apply)
UPDATE Bookings 
SET ServiceStatus = 'pending' 
WHERE ServiceStatus IS NULL OR ServiceStatus = '';

-- Step 3: Remove unnecessary columns
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- First, create a backup of existing data
CREATE TABLE Bookings_Backup AS SELECT * FROM Bookings;

-- Create the new table structure without the unwanted columns
CREATE TABLE Bookings_New (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserMobile TEXT NOT NULL,
    DealerId INTEGER NOT NULL,
    ServiceId INTEGER NOT NULL,
    BrandId INTEGER NOT NULL,
    VehicleId INTEGER NOT NULL,
    CarNumber TEXT NOT NULL,
    CarModel TEXT NOT NULL,
    CarBrand TEXT NOT NULL,
    CarYear INTEGER,
    Price DECIMAL(10,2) NOT NULL,
    PaymentStatus TEXT NOT NULL DEFAULT 'Completed',
    BookingStatus TEXT NOT NULL DEFAULT 'Pending',
    ServiceStatus TEXT NOT NULL DEFAULT 'pending',
    PaymentMethod TEXT,
    PaymentMethodType TEXT,
    TransactionId TEXT,
    BankName TEXT,
    DealerNotes TEXT,
    CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table (excluding the columns we want to remove)
INSERT INTO Bookings_New (
    Id, UserMobile, DealerId, ServiceId, BrandId, VehicleId,
    CarNumber, CarModel, CarBrand, CarYear, Price,
    PaymentStatus, BookingStatus, ServiceStatus,
    PaymentMethod, PaymentMethodType, TransactionId, BankName,
    DealerNotes, CreatedAt, UpdatedAt
)
SELECT 
    Id, UserMobile, DealerId, ServiceId, BrandId, VehicleId,
    CarNumber, CarModel, CarBrand, CarYear, Price,
    PaymentStatus, BookingStatus, ServiceStatus,
    PaymentMethod, PaymentMethodType, TransactionId, BankName,
    DealerNotes, CreatedAt, UpdatedAt
FROM Bookings;

-- Drop the old table
DROP TABLE Bookings;

-- Rename the new table to the original name
ALTER TABLE Bookings_New RENAME TO Bookings;

-- Step 4: Verify the changes
-- Show the updated table structure
.schema Bookings

-- Show sample data to verify ServiceStatus column
SELECT Id, UserMobile, ServiceStatus, BookingStatus, PaymentStatus, CarNumber, CarModel 
FROM Bookings 
LIMIT 5;

-- Clean up backup table (uncomment if you want to remove it)
-- DROP TABLE Bookings_Backup;

-- Migration completed successfully
.print 'Migration completed: ServiceStatus column added with default value "pending" and unnecessary columns removed.';
