# StockSimul Server Startup Script
Write-Host "Starting StockSimul Server..." -ForegroundColor Green
Set-Location "C:\StockSimul"
npx tsx server/index.ts
