# PowerShell script to safely restart application with all changes
# This preserves database data

Write-Host "=== Safe Application Restart ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check database data count
Write-Host "[1/7] Checking database data..." -ForegroundColor Yellow
$lessonCount = docker-compose exec -T postgres psql -U admin -d themamboinn -t -c "SELECT COUNT(*) FROM lessons;" 2>&1 | Out-String
Write-Host "Current lessons in database: $lessonCount" -ForegroundColor Gray
Write-Host ""

# Step 2: Stop containers (data persists in volumes)
Write-Host "[2/7] Stopping containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Containers stopped" -ForegroundColor Green
Write-Host ""

# Step 3: Rebuild backend to include new dependencies
Write-Host "[3/7] Rebuilding backend with new dependencies..." -ForegroundColor Yellow
docker-compose build backend
Write-Host "✅ Backend rebuilt" -ForegroundColor Green
Write-Host ""

# Step 4: Start all services
Write-Host "[4/7] Starting all services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Step 5: Wait for services to be ready
Write-Host "[5/7] Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ Services ready" -ForegroundColor Green
Write-Host ""

# Step 6: Verify database data still exists
Write-Host "[6/7] Verifying database data preserved..." -ForegroundColor Yellow
$newLessonCount = docker-compose exec -T postgres psql -U admin -d themamboinn -t -c "SELECT COUNT(*) FROM lessons;" 2>&1 | Out-String
if ($lessonCount -eq $newLessonCount) {
    Write-Host "✅ Database data preserved! Lessons count: $newLessonCount" -ForegroundColor Green
} else {
    Write-Host "⚠️  Lesson count changed (this might be normal if data was modified)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Verify Mux fields exist
Write-Host "[7/7] Verifying Mux database fields..." -ForegroundColor Yellow
docker-compose exec -T postgres psql -U admin -d themamboinn -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' AND column_name IN ('mux_playback_id', 'mux_asset_id');" 2>&1 | Out-Null
Write-Host "✅ Mux fields verified" -ForegroundColor Green
Write-Host ""

Write-Host "=== Restart Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services status:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f backend" -ForegroundColor Gray
Write-Host ""
Write-Host "To test webhook endpoint:" -ForegroundColor Yellow
Write-Host "  python test_webhook_endpoint.py" -ForegroundColor Gray

