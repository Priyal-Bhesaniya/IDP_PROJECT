-- Create ExecutiveCars table
USE AutoLoopDB;
GO

-- Drop table if it exists
IF OBJECT_ID('dbo.ExecutiveCars', 'U') IS NOT NULL
    DROP TABLE dbo.ExecutiveCars;
GO

-- Create ExecutiveCars table
CREATE TABLE dbo.ExecutiveCars (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DealerId INT NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    CarNumber NVARCHAR(50) NOT NULL,
    MinKm DECIMAL(10,2) NOT NULL DEFAULT 0,
    ExtraKm DECIMAL(10,2) NOT NULL DEFAULT 0,
    MaxKm DECIMAL(10,2) NOT NULL DEFAULT 0,
    GearType NVARCHAR(50) NOT NULL,
    FuelType NVARCHAR(50) NOT NULL,
    Seats INT NOT NULL,
    PricePerDay DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy INT NOT NULL,
    UpdatedBy INT NULL
);
GO

-- Add foreign key constraint for DealerId (assuming Dealers table exists)
-- IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ExecutiveCars_Dealers')
--     ALTER TABLE dbo.ExecutiveCars DROP CONSTRAINT FK_ExecutiveCars_Dealers;
-- GO

-- ALTER TABLE dbo.ExecutiveCars
-- ADD CONSTRAINT FK_ExecutiveCars_Dealers 
-- FOREIGN KEY (DealerId) REFERENCES dbo.Dealers(Id);
-- GO

-- Add indexes for better performance
CREATE INDEX IX_ExecutiveCars_DealerId ON dbo.ExecutiveCars(DealerId);
CREATE INDEX IX_ExecutiveCars_Status ON dbo.ExecutiveCars(Status);
CREATE INDEX IX_ExecutiveCars_CarNumber ON dbo.ExecutiveCars(CarNumber);
GO

-- Add check constraint for Status
ALTER TABLE dbo.ExecutiveCars
ADD CONSTRAINT CK_ExecutiveCars_Status 
CHECK (Status IN ('active', 'inactive'));
GO

-- Insert sample data for testing
INSERT INTO dbo.ExecutiveCars (DealerId, Category, CarNumber, MinKm, ExtraKm, MaxKm, GearType, FuelType, Seats, PricePerDay, Status, CreatedBy)
VALUES 
(1, 'BMW', 'GJ031234BD', 50, 5, 500, 'Automatic', 'Petrol', 5, 2500.00, 'active', 1),
(1, 'Mercedes', 'GJ045678CD', 75, 8, 750, 'Automatic', 'Diesel', 7, 3500.00, 'active', 1),
(1, 'Audi', 'GJ078901EF', 60, 6, 600, 'Manual', 'Petrol', 5, 2800.00, 'inactive', 1),
(2, 'Toyota', 'GJ022334GH', 40, 4, 400, 'Automatic', 'Hybrid', 5, 1800.00, 'active', 2),
(2, 'Honda', 'GJ055667IJ', 45, 5, 450, 'Manual', 'Petrol', 5, 2000.00, 'active', 2);
GO

-- Select to verify the data
SELECT * FROM dbo.ExecutiveCars;
GO
