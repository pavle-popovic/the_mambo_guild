# PowerShell script to help set up ngrok for Mux webhook testing

Write-Host "=== Mux Webhook Setup Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
Write-Host "Checking for ngrok..." -ForegroundColor Yellow
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokPath) {
    Write-Host "❌ ngrok is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://ngrok.com/download" -ForegroundColor White
    Write-Host "  2. Or use chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "  3. Or use npm: npm install -g ngrok" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ ngrok is installed!" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running on port 8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is not accessible on port 8000" -ForegroundColor Red
    Write-Host "   Make sure your backend is running:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d backend" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Starting ngrok tunnel..." -ForegroundColor Yellow
Write-Host "Your webhook URL will be displayed below:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy the HTTPS URL (https://xxxxx.ngrok-free.app)" -ForegroundColor Yellow
Write-Host "Your webhook URL will be: https://xxxxx.ngrok-free.app/api/mux/webhook" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop ngrok when done" -ForegroundColor Gray
Write-Host ""

# Start ngrok
ngrok http 8000

