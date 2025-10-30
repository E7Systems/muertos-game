#!/bin/bash
# Muertos Game - Deployment Script
# Deploy to muertos.e7systems.com

# Configuration
SERVER="your-username@muertos.e7systems.com"
DEPLOY_DIR="/var/www/muertos.e7systems.com"
BACKUP_DIR="/var/www/backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Muertos Game Deployment Script${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Check if files exist
if [ ! -f "index.html" ] || [ ! -f "game.js" ]; then
    echo -e "${RED}Error: Required files not found!${NC}"
    echo "Make sure you're in the muertos-game directory"
    exit 1
fi

# Ask for confirmation
echo -e "${YELLOW}Deploy to muertos.e7systems.com?${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Step 1: Upload files
echo -e "${GREEN}[1/5] Uploading files to server...${NC}"
scp index.html game.js .htaccess $SERVER:/tmp/ || {
    echo -e "${RED}Failed to upload files${NC}"
    exit 1
}

echo -e "${GREEN}[2/5] Uploading assets...${NC}"
scp -r assets $SERVER:/tmp/ || {
    echo -e "${RED}Failed to upload assets${NC}"
    exit 1
}

# Step 2: Create backup and move files
echo -e "${GREEN}[3/5] Creating backup and deploying...${NC}"
ssh $SERVER << 'ENDSSH'
# Create backup directory if it doesn't exist
sudo mkdir -p /var/www/backups

# Backup existing files
if [ -d "/var/www/muertos.e7systems.com" ]; then
    BACKUP_NAME="muertos-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "Creating backup: $BACKUP_NAME"
    sudo tar -czf /var/www/backups/$BACKUP_NAME /var/www/muertos.e7systems.com 2>/dev/null
fi

# Create deploy directory if it doesn't exist
sudo mkdir -p /var/www/muertos.e7systems.com

# Move files from tmp to web directory
echo "Moving files to web directory..."
sudo mv /tmp/index.html /var/www/muertos.e7systems.com/
sudo mv /tmp/game.js /var/www/muertos.e7systems.com/
sudo mv /tmp/.htaccess /var/www/muertos.e7systems.com/

# Remove old assets and move new ones
sudo rm -rf /var/www/muertos.e7systems.com/assets
sudo mv /tmp/assets /var/www/muertos.e7systems.com/

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo find /var/www/muertos.e7systems.com -type d -exec chmod 755 {} \;
sudo find /var/www/muertos.e7systems.com -type f -exec chmod 644 {} \;
ENDSSH

# Step 3: Verify
echo -e "${GREEN}[4/5] Verifying deployment...${NC}"
ssh $SERVER << 'ENDSSH'
if [ -f "/var/www/muertos.e7systems.com/index.html" ]; then
    echo "✓ index.html deployed"
else
    echo "✗ index.html missing"
fi

if [ -f "/var/www/muertos.e7systems.com/game.js" ]; then
    echo "✓ game.js deployed"
else
    echo "✗ game.js missing"
fi

if [ -d "/var/www/muertos.e7systems.com/assets" ]; then
    ASSET_COUNT=$(find /var/www/muertos.e7systems.com/assets -type f | wc -l)
    echo "✓ assets deployed ($ASSET_COUNT files)"
else
    echo "✗ assets directory missing"
fi
ENDSSH

# Step 4: Reload Apache
echo -e "${GREEN}[5/5] Reloading Apache...${NC}"
ssh $SERVER "sudo systemctl reload apache2" || {
    echo -e "${YELLOW}Warning: Could not reload Apache. You may need to do this manually.${NC}"
}

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "Visit: ${GREEN}http://muertos.e7systems.com${NC}"
echo ""
echo "To view logs on server:"
echo "  sudo tail -f /var/log/apache2/muertos.e7systems.com-error.log"
echo ""
