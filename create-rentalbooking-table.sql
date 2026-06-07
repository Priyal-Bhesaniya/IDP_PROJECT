USE [AutoLoopDB]
GO

-- Create RentalBookings table
CREATE TABLE [dbo].[RentalBookings](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CustomerMobile] [nvarchar](20) NOT NULL,
	[CustomerId] [int] NOT NULL,
	[CustomerName] [nvarchar](100) NOT NULL,
	[DealerId] [int] NOT NULL,
	[DealerName] [nvarchar](100) NOT NULL,
	[ExecutiveCarId] [int] NOT NULL,
	[CarCategory] [nvarchar](50) NOT NULL,
	[CarNumber] [nvarchar](20) NOT NULL,
	[MinKm] [int] NOT NULL,
	[ExtraKm] [int] NOT NULL,
	[MaxKm] [int] NOT NULL,
	[GearType] [nvarchar](20) NOT NULL,
	[FuelType] [nvarchar](20) NOT NULL,
	[Seats] [int] NOT NULL,
	[PricePerDay] [decimal](18, 2) NOT NULL,
	[RentalDays] [int] NOT NULL,
	[TotalAmount] [decimal](18, 2) NOT NULL,
	[PaymentMethod] [nvarchar](20) NOT NULL,
	[PaymentMethodType] [nvarchar](20) NOT NULL,
	[BankName] [nvarchar](100) NULL,
	[PaymentStatus] [nvarchar](20) NOT NULL DEFAULT N'Completed',
	[RentalStatus] [nvarchar](20) NOT NULL DEFAULT N'Pending',
	[FuelPolicy] [nvarchar](50) NOT NULL,
	[InsurancePolicy] [nvarchar](50) NOT NULL,
	[AgreementAccepted] [bit] NOT NULL,
	[DigitalSignature] [nvarchar](200) NOT NULL,
	[TransactionId] [nvarchar](50) NOT NULL,
	[CreatedAt] [datetime] NOT NULL DEFAULT GETUTCDATE(),
	[UpdatedAt] [datetime] NOT NULL DEFAULT GETUTCDATE(),
 CONSTRAINT [PK_RentalBookings] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Add foreign key constraints
ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [FK_RentalBookings_Dealers] FOREIGN KEY([DealerId])
REFERENCES [dbo].[Dealers] ([Id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [FK_RentalBookings_Dealers]
GO

ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [FK_RentalBookings_ExecutiveCars] FOREIGN KEY([ExecutiveCarId])
REFERENCES [dbo].[ExecutiveCars] ([Id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [FK_RentalBookings_ExecutiveCars]
GO

-- Add indexes for better performance
CREATE NONCLUSTERED INDEX [IX_RentalBookings_CustomerMobile] ON [dbo].[RentalBookings] ([CustomerMobile])
GO

CREATE NONCLUSTERED INDEX [IX_RentalBookings_DealerId] ON [dbo].[RentalBookings] ([DealerId])
GO

CREATE NONCLUSTERED INDEX [IX_RentalBookings_TransactionId] ON [dbo].[RentalBookings] ([TransactionId])
GO

CREATE NONCLUSTERED INDEX [IX_RentalBookings_CreatedAt] ON [dbo].[RentalBookings] ([CreatedAt])
GO

-- Add check constraints
ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [CK_RentalBookings_RentalDays] CHECK (([RentalDays] >= (1) AND [RentalDays] <= (365)))
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [CK_RentalBookings_RentalDays]
GO

ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [CK_RentalBookings_PricePerDay] CHECK (([PricePerDay] >= (0)))
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [CK_RentalBookings_PricePerDay]
GO

ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [CK_RentalBookings_TotalAmount] CHECK (([TotalAmount] >= (0)))
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [CK_RentalBookings_TotalAmount]
GO

ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [CK_RentalBookings_PaymentStatus] CHECK (([PaymentStatus] = N'Completed' OR [PaymentStatus] = N'Pending' OR [PaymentStatus] = N'Failed'))
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [CK_RentalBookings_PaymentStatus]
GO

ALTER TABLE [dbo].[RentalBookings] WITH CHECK ADD CONSTRAINT [CK_RentalBookings_RentalStatus] CHECK (([RentalStatus] = N'Pending' OR [RentalStatus] = N'Confirmed' OR [RentalStatus] = N'Active' OR [RentalStatus] = N'Completed' OR [RentalStatus] = N'Cancelled'))
GO

ALTER TABLE [dbo].[RentalBookings] CHECK CONSTRAINT [CK_RentalBookings_RentalStatus]
GO

PRINT 'RentalBookings table created successfully!'
GO
