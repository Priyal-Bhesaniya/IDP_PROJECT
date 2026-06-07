# Database Scripts

This folder contains all database migration and utility scripts for the IDP Project.

## 📁 Scripts Overview

### 🔄 Migration Scripts

#### 1. **database-migration-sqlserver.sql**
- **Purpose**: Main migration script for SQL Server
- **Database**: AutoLoopDB
- **Server**: DESKTOP-ALT95HP\SQLEXPRESS
- **Actions**:
  - ✅ Adds `ServiceStatus` column with default `'pending'`
  - ✅ Removes unnecessary columns: `CarColor`, `AdditionalNotes`, `CardName`, `CardLast4Digits`, `UpiId`
- **Status**: ✅ COMPLETED

#### 2. **database-migration-sqlite.sql**
- **Purpose**: Migration script for SQLite database
- **Actions**: Same as SQL Server version but for SQLite
- **Status**: ⚠️ NOT USED (project uses SQL Server)

#### 3. **add-servicestatus-column.sql**
- **Purpose**: Standalone script to add ServiceStatus column
- **Database**: AutoLoopDB
- **Actions**: Adds `ServiceStatus NVARCHAR(20) NOT NULL DEFAULT 'pending'`
- **Status**: ✅ COMPLETED

### 🛠️ Utility Scripts

#### 4. **check-vehicles.sql**
- **Purpose**: Check vehicle data and related tables
- **Actions**: Queries vehicle information from database

#### 5. **database-scripts.sql**
- **Purpose**: General database utility scripts
- **Actions**: Various database operations and checks

### 🚀 Execution Scripts

#### 6. **run-migration.bat**
- **Purpose**: Batch script to run SQLite migration (deprecated)
- **Status**: ⚠️ NOT USED (project uses SQL Server)

## 📋 How to Run Scripts

### SQL Server Scripts
```bash
# Using sqlcmd with Windows Authentication
sqlcmd -S DESKTOP-ALT95HP\SQLEXPRESS -E -i Scripts\database-migration-sqlserver.sql

# Using sqlcmd with SQL Server Authentication
sqlcmd -S DESKTOP-ALT95HP\SQLEXPRESS -U sa -P "YourPassword" -i Scripts\database-migration-sqlserver.sql
```

### In SQL Server Management Studio (SSMS)
1. Open SSMS
2. Connect to `DESKTOP-ALT95HP\SQLEXPRESS`
3. Select `AutoLoopDB` database
4. Open script file and execute (F5)

## 🗂️ Database Schema Changes

### ✅ Completed Changes
- **Added**: `ServiceStatus` column to `Bookings` table
- **Removed**: Unnecessary payment detail columns
- **Default**: Service status defaults to `'pending'`

### 📊 Current Bookings Table Structure
```sql
Bookings (
    Id, UserMobile, DealerId, ServiceId, VehicleId,
    CarNumber, CarModel, CarBrand, CarYear, Price,
    PaymentStatus, BookingStatus, ServiceStatus,  -- NEW
    PaymentMethod, PaymentMethodType, TransactionId, 
    BankName, DealerNotes, CreatedAt, UpdatedAt
)
```

## 🔄 Service Status Flow
1. **pending** (default) - When booking is created
2. **approved** - When dealer accepts the request
3. **completed** - When dealer finishes the service
4. **rejected** - If dealer rejects the request

## 📝 Notes
- All migration scripts have been successfully executed
- Database: `AutoLoopDB`
- Server: `DESKTOP-ALT95HP\SQLEXPRESS`
- Backup: Original data preserved during migration
- Service status tracking is now fully functional

---
*Last Updated: 2026-04-24*
*Migration Status: ✅ COMPLETED*
