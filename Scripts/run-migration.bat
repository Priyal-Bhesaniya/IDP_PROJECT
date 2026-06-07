@echo off
echo Running database migration...
echo.

REM Check if database file exists
if not exist "dotnet-api\dealer_management.db" (
    echo Error: Database file not found at dotnet-api\dealer_management.db
    echo Please make sure the database file exists before running migration.
    pause
    exit /b 1
)

REM Run the migration script
echo Executing migration script...
sqlite3 dotnet-api\dealer_management.db < database-migration.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration completed successfully!
    echo.
    echo Changes made:
    echo - Added ServiceStatus column with default value 'pending'
    echo - Removed columns: CarColor, AdditionalNotes, CardName, CardLast4Digits, UpiId
    echo.
    echo Backup created as Bookings_Backup table (can be removed if needed)
) else (
    echo.
    echo Migration failed! Error code: %ERRORLEVEL%
    echo Please check the SQL script and try again.
)

echo.
pause
