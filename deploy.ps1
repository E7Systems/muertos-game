# Muertos Game - Deployment Script (PowerShell)
# Deploy to muertos.e7systems.com from Windows

# Configuration
$SERVER = "e7system@muertos.e7systems.com"
$DEPLOY_DIR = "/var/www/muertos.e7systems.com"

Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Muertos Game Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if files exist
if (-not (Test-Path "index.html") -or -not (Test-Path "game.js")) {
    Write-Host "Error: Required files not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the muertos-game directory"
    exit 1
}

# Check if SCP is available (requires OpenSSH on Windows)
try {
    Get-Command scp -ErrorAction Stop | Out-Null
} catch {
    Write-Host "Error: SCP not found!" -ForegroundColor Red
    Write-Host "Please install OpenSSH Client from Windows Optional Features"
    Write-Host "Or use WinSCP/FileZilla for manual deployment (see DEPLOYMENT.md)"
    exit 1
}

# Ask for confirmation
$confirmation = Read-Host "Deploy to muertos.e7systems.com? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Deployment cancelled"
    exit 0
}

Write-Host "[1/4] Uploading files to server..." -ForegroundColor Green
scp index.html, game.js, .htaccess "$SERVER:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upload files" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Uploading assets..." -ForegroundColor Green
scp -r assets "$SERVER:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to upload assets" -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Deploying on server..." -ForegroundColor Green
$commands = @"
sudo mkdir -p /var/www/muertos.e7systems.com
sudo mv /tmp/index.html /var/www/muertos.e7systems.com/
sudo mv /tmp/game.js /var/www/muertos.e7systems.com/
sudo mv /tmp/.htaccess /var/www/muertos.e7systems.com/
sudo rm -rf /var/www/muertos.e7systems.com/assets
sudo mv /tmp/assets /var/www/muertos.e7systems.com/
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo find /var/www/muertos.e7systems.com -type d -exec chmod 755 {} \;
sudo find /var/www/muertos.e7systems.com -type f -exec chmod 644 {} \;
"@

ssh $SERVER $commands
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Some commands may have failed. Check server manually." -ForegroundColor Yellow
}

Write-Host "[4/4] Reloading Apache..." -ForegroundColor Green
ssh $SERVER "sudo systemctl reload apache2"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Visit: " -NoNewline
Write-Host "http://muertos.e7systems.com" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Update the `$SERVER variable in this script with your actual username"
Write-Host ""
