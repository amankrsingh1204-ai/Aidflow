# Run this script as Administrator
# Right-click and select "Run with PowerShell" or "Run as Administrator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows Defender Fix for Rust Builds" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click on this file (fix-defender-admin.ps1)" -ForegroundColor Yellow
    Write-Host "2. Select 'Run with PowerShell' or 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

$projectPath = "C:\Users\amank\Desktop\project\AidFlow"
$targetPath = "C:\Users\amank\Desktop\project\AidFlow\target"

# Add exclusions
Write-Host "Adding Windows Defender exclusions..." -ForegroundColor Yellow

try {
    # Add project folder
    Add-MpPreference -ExclusionPath $projectPath -ErrorAction Stop
    Write-Host "✓ Added exclusion: $projectPath" -ForegroundColor Green
    
    # Add target folder specifically
    if (Test-Path $targetPath) {
        Add-MpPreference -ExclusionPath $targetPath -ErrorAction Stop
        Write-Host "✓ Added exclusion: $targetPath" -ForegroundColor Green
    }
    
    # Add cargo cache
    $cargoPath = "$env:USERPROFILE\.cargo"
    if (Test-Path $cargoPath) {
        Add-MpPreference -ExclusionPath $cargoPath -ErrorAction Stop
        Write-Host "✓ Added exclusion: $cargoPath" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Warning: Some exclusions may already exist or failed to add" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Verifying exclusions..." -ForegroundColor Yellow
$exclusions = Get-MpPreference | Select-Object -ExpandProperty ExclusionPath

if ($exclusions -contains $projectPath) {
    Write-Host "✓ Project folder is excluded" -ForegroundColor Green
} else {
    Write-Host "⚠️ Project folder exclusion not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Close this window" -ForegroundColor White
Write-Host "2. Open your PowerShell terminal" -ForegroundColor White
Write-Host "3. Run these commands:" -ForegroundColor White
Write-Host ""
Write-Host "   cd C:\Users\amank\Desktop\project\AidFlow" -ForegroundColor Cyan
Write-Host "   Remove-Item -Recurse -Force target -ErrorAction SilentlyContinue" -ForegroundColor Cyan
Write-Host "   cd contracts\donation-contract" -ForegroundColor Cyan
Write-Host "   stellar contract build" -ForegroundColor Cyan
Write-Host ""
Write-Host "If it still fails, you may need to:" -ForegroundColor Yellow
Write-Host "- Restart your computer" -ForegroundColor Yellow
Write-Host "- OR temporarily disable Real-time protection in Windows Security" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
