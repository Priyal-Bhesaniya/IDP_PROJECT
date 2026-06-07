-- Create Booking table
CREATE TABLE [Bookings] (
    [Id] int NOT NULL IDENTITY,
    [UserMobile] nvarchar(10) NOT NULL,
    [DealerId] int NOT NULL,
    [ServiceId] int NOT NULL,
    [VehicleId] int NOT NULL,
    [CarNumber] nvarchar(20) NOT NULL,
    [CarModel] nvarchar(100) NOT NULL,
    [CarBrand] nvarchar(100) NOT NULL,
    [CarYear] int NOT NULL,
    [CarColor] nvarchar(50) NULL,
    [AdditionalNotes] nvarchar(500) NULL,
    [Price] decimal(10,2) NOT NULL,
    [PaymentStatus] nvarchar(20) NOT NULL DEFAULT N'Pending',
    [BookingStatus] nvarchar(20) NOT NULL DEFAULT N'Pending',
    [PaymentMethod] nvarchar(50) NULL,
    [TransactionId] nvarchar(100) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NULL,
    [DealerNotes] nvarchar(500) NULL,
    [PaymentMethodType] nvarchar(20) NULL,
    [CardName] nvarchar(100) NULL,
    [CardLast4Digits] nvarchar(20) NULL,
    [UpiId] nvarchar(50) NULL,
    [BankName] nvarchar(100) NULL,
    CONSTRAINT [PK_Bookings] PRIMARY KEY ([Id])
);

-- Create foreign key relationships without cascade delete
ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Dealers_DealerId] 
    FOREIGN KEY ([DealerId]) REFERENCES [Dealers] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Services_ServiceId] 
    FOREIGN KEY ([ServiceId]) REFERENCES [Services] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Bookings] ADD CONSTRAINT [FK_Bookings_Vehicles_VehicleId] 
    FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([Id]) ON DELETE NO ACTION;

-- Create indexes for better performance
CREATE INDEX [IX_Bookings_UserMobile] ON [Bookings] ([UserMobile]);
CREATE INDEX [IX_Bookings_DealerId] ON [Bookings] ([DealerId]);
CREATE INDEX [IX_Bookings_CreatedAt] ON [Bookings] ([CreatedAt]);
