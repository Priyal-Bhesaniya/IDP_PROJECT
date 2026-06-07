# PowerShell script to run backend with bypass
Write-Host "Starting backend with security bypass..."
cd "c:\Users\Gannu\OneDrive\Desktop\IDP_PROJECT\dotnet-api"

# Try to run with bypass
try {
    & dotnet run --configuration Release
} catch {
    Write-Host "Attempting to run with bypass..."
    Start-Process -FilePath "dotnet" -ArgumentList "run --configuration Release" -NoNewWindow -Wait
}

Read-Host "Press Enter to exit"
