# AidFlow - Complete Setup Script
# Run this script to set up the entire AidFlow project

Write-Host "🌊 AidFlow Setup Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "PostgreSQL found" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL not found. Please install PostgreSQL 14+ from https://www.postgresql.org" -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host ""
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
Write-Host "Root dependencies installed" -ForegroundColor Green

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Write-Host "Backend dependencies installed" -ForegroundColor Green

# Setup backend environment
if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Backend .env created. Please edit with your settings." -ForegroundColor Green
} else {
    Write-Host "Backend .env already exists" -ForegroundColor Green
}

Set-Location ..

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Write-Host "Frontend dependencies installed" -ForegroundColor Green
Set-Location ..

# Database setup
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow
$dbSetup = Read-Host "Do you want to create the database now? (y/n)"
if ($dbSetup -eq "y") {
    $dbUser = Read-Host "PostgreSQL username (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) {
        $dbUser = "postgres"
    }
    
    Write-Host "Creating database..." -ForegroundColor Yellow
    
    # Create database
    $createDbCmd = "CREATE DATABASE aidflow;"
    echo $createDbCmd | psql -U $dbUser postgres 2>$null
    
    # Run schema
    Write-Host "Running database schema..." -ForegroundColor Yellow
    psql -U $dbUser -d aidflow -f database\schema.sql
    
    Write-Host "Database setup complete" -ForegroundColor Green
} else {
    Write-Host "Skipping database setup. Run manually with:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -c 'CREATE DATABASE aidflow;'" -ForegroundColor Gray
    Write-Host "  psql -U postgres -d aidflow -f database\schema.sql" -ForegroundColor Gray
}

# Setup complete
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit backend\.env with your Stellar credentials" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start both backend and frontend" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see:" -ForegroundColor Yellow
Write-Host "  - docs\QUICK_START.md" -ForegroundColor White
Write-Host "  - docs\DEMO_GUIDE.md" -ForegroundColor White
Write-Host "  - docs\API.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Cyan
