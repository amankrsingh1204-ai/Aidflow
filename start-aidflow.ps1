# PowerShell script to start AidFlow
Write-Host "🚀 Starting AidFlow Platform..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "📝 Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
}

Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "✨ AidFlow is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "💾 Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for services to be ready..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "To stop: docker-compose down" -ForegroundColor Gray
