# Deployment Guide - Muertos Game

Deploy the Día de los Muertos card game to muertos.e7systems.com on Ubuntu with Apache2.

## Prerequisites

- Ubuntu server with Apache2 installed
- SSH access to the server
- Domain muertos.e7systems.com pointing to your server's IP
- sudo privileges

## Files to Deploy

The following files need to be uploaded to the server:
```
index.html
game.js
.htaccess
assets/
  ├── lobby.jpg
  ├── Play.jpg
  ├── winner.jpg
  ├── try_again.jpg
  ├── card_back.png
  ├── card_cat.png
  ├── card_cookies.png
  ├── card_cross.png
  ├── card_dog.png
  ├── card_lady.png
  ├── card_man.png
  ├── card_pitcher.png
  └── card_winner.png
```

**Note:** Do NOT upload:
- node_modules/
- package.json
- package-lock.json
- .git/
- .gitignore
- README.md
- muertos.e7systems.com.conf (configured separately)
- DEPLOYMENT.md

## Deployment Steps

### 1. Connect to Your Server

```bash
ssh your-username@muertos.e7systems.com
```

### 2. Create Web Directory

```bash
sudo mkdir -p /var/www/muertos.e7systems.com
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo chmod -R 755 /var/www/muertos.e7systems.com
```

### 3. Configure Apache2

Copy the Apache configuration file to your server:

```bash
# On your local machine, upload the config file
scp muertos.e7systems.com.conf your-username@muertos.e7systems.com:/tmp/

# On the server
sudo mv /tmp/muertos.e7systems.com.conf /etc/apache2/sites-available/
sudo a2ensite muertos.e7systems.com.conf
```

### 4. Enable Required Apache Modules

```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

### 5. Upload Game Files

**Option A: Using SCP (from Windows/Local Machine)**

```bash
# From your local machine in the muertos-game directory
scp index.html game.js .htaccess your-username@muertos.e7systems.com:/tmp/
scp -r assets your-username@muertos.e7systems.com:/tmp/

# Then on the server
sudo mv /tmp/index.html /var/www/muertos.e7systems.com/
sudo mv /tmp/game.js /var/www/muertos.e7systems.com/
sudo mv /tmp/.htaccess /var/www/muertos.e7systems.com/
sudo mv /tmp/assets /var/www/muertos.e7systems.com/
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
```

**Option B: Using FTP/SFTP Client**

Use FileZilla, WinSCP, or similar:
1. Connect to muertos.e7systems.com via SFTP
2. Upload files to /var/www/muertos.e7systems.com/
3. Set permissions (see step 7)

**Option C: Using Git (Recommended for updates)**

```bash
# On the server
cd /var/www/muertos.e7systems.com
sudo git init
sudo git remote add origin https://github.com/E7Systems/muertos-game.git
sudo git pull origin main
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
```

### 6. Test Apache Configuration

```bash
sudo apache2ctl configtest
```

Should return: `Syntax OK`

### 7. Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo find /var/www/muertos.e7systems.com -type d -exec chmod 755 {} \;
sudo find /var/www/muertos.e7systems.com -type f -exec chmod 644 {} \;
```

### 8. Restart Apache

```bash
sudo systemctl restart apache2
```

### 9. Verify Deployment

Open a browser and navigate to:
```
http://muertos.e7systems.com
```

You should see the lobby screen with "Toca la pantalla para comenzar"

## Optional: Enable HTTPS with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-apache
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --apache -d muertos.e7systems.com
```

Follow the prompts. Certbot will automatically configure SSL in Apache.

### 3. Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### 4. Update Apache Config

The SSL configuration is already prepared in `muertos.e7systems.com.conf` (commented out).
Certbot will automatically create the SSL virtual host.

## Updating the Game

When you make changes to the game:

**Option 1: Manual Update**
```bash
# Upload changed files via SCP
scp game.js your-username@muertos.e7systems.com:/tmp/
ssh your-username@muertos.e7systems.com
sudo mv /tmp/game.js /var/www/muertos.e7systems.com/
sudo chown www-data:www-data /var/www/muertos.e7systems.com/game.js
```

**Option 2: Git Pull (if using Git)**
```bash
ssh your-username@muertos.e7systems.com
cd /var/www/muertos.e7systems.com
sudo git pull origin main
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
```

**Option 3: Full Re-deployment**
```bash
# Backup old version first
sudo mv /var/www/muertos.e7systems.com /var/www/muertos.e7systems.com.backup
# Then follow deployment steps again
```

## Troubleshooting

### Site Not Loading

1. Check Apache status:
   ```bash
   sudo systemctl status apache2
   ```

2. Check Apache error logs:
   ```bash
   sudo tail -f /var/log/apache2/muertos.e7systems.com-error.log
   ```

3. Verify DNS is pointing to your server:
   ```bash
   nslookup muertos.e7systems.com
   ```

### Cards Not Loading

1. Check file permissions:
   ```bash
   ls -la /var/www/muertos.e7systems.com/assets/
   ```

2. Check Apache access logs:
   ```bash
   sudo tail -f /var/log/apache2/muertos.e7systems.com-access.log
   ```

3. Open browser console (F12) and check for 404 errors

### Performance Issues

1. Verify compression is enabled:
   ```bash
   apache2ctl -M | grep deflate
   ```

2. Check Apache modules:
   ```bash
   apache2ctl -M | grep -E "(rewrite|headers|expires)"
   ```

## Quick Deployment Script

Save this as `deploy.sh`:

```bash
#!/bin/bash
# Quick deployment script for Muertos Game

SERVER="your-username@muertos.e7systems.com"
DEPLOY_DIR="/var/www/muertos.e7systems.com"

echo "Uploading files to server..."
scp index.html game.js .htaccess $SERVER:/tmp/
scp -r assets $SERVER:/tmp/

echo "Moving files to web directory..."
ssh $SERVER << 'ENDSSH'
sudo mv /tmp/index.html /var/www/muertos.e7systems.com/
sudo mv /tmp/game.js /var/www/muertos.e7systems.com/
sudo mv /tmp/.htaccess /var/www/muertos.e7systems.com/
sudo rm -rf /var/www/muertos.e7systems.com/assets
sudo mv /tmp/assets /var/www/muertos.e7systems.com/
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo systemctl reload apache2
ENDSSH

echo "Deployment complete!"
echo "Visit: http://muertos.e7systems.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Kiosk Mode Setup (Optional)

If deploying to a dedicated kiosk:

1. **Install Chromium in kiosk mode:**
   ```bash
   sudo apt install chromium-browser unclutter
   ```

2. **Create autostart script** (`~/.config/autostart/kiosk.desktop`):
   ```
   [Desktop Entry]
   Type=Application
   Name=Kiosk
   Exec=chromium-browser --kiosk --no-sandbox http://muertos.e7systems.com
   ```

3. **Hide mouse cursor:**
   ```bash
   unclutter -idle 0 &
   ```

## Server Maintenance

### Backup

```bash
sudo tar -czf muertos-backup-$(date +%Y%m%d).tar.gz /var/www/muertos.e7systems.com
```

### Monitor Logs

```bash
# Watch error logs in real-time
sudo tail -f /var/log/apache2/muertos.e7systems.com-error.log

# Watch access logs in real-time
sudo tail -f /var/log/apache2/muertos.e7systems.com-access.log
```

### Check Disk Space

```bash
df -h
```

## Support

For issues, check:
- Apache error logs: `/var/log/apache2/muertos.e7systems.com-error.log`
- Apache access logs: `/var/log/apache2/muertos.e7systems.com-access.log`
- Browser console (F12)

## Checklist

- [ ] DNS configured for muertos.e7systems.com
- [ ] Apache2 installed and running
- [ ] Web directory created with proper permissions
- [ ] Apache site configuration enabled
- [ ] Required Apache modules enabled
- [ ] Game files uploaded
- [ ] Permissions set correctly
- [ ] Apache restarted
- [ ] Site accessible in browser
- [ ] All cards loading properly
- [ ] Game functionality tested
- [ ] SSL certificate installed (optional)
