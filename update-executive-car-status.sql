USE [AutoLoopDB]
GO

-- Drop existing check constraint if it exists
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ExecutiveCars_Status')
BEGIN
    ALTER TABLE [dbo].[ExecutiveCars] DROP CONSTRAINT [CK_ExecutiveCars_Status]
END
GO

-- Add updated check constraint that includes 'booked' status
ALTER TABLE [dbo].[ExecutiveCars] WITH CHECK ADD CONSTRAINT [CK_ExecutiveCars_Status] CHECK (([Status] = 'active' OR [Status] = 'inactive' OR [Status] = 'booked'))
GO

ALTER TABLE [dbo].[ExecutiveCars] CHECK CONSTRAINT [CK_ExecutiveCars_Status]
GO

PRINT 'ExecutiveCars status constraint updated to include booked status!'
GO
