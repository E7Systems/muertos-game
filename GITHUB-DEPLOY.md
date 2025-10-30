# Simple GitHub Deployment Guide

Deploy the Muertos game to muertos.e7systems.com using GitHub and direct server commands.

## Step 1: Push to GitHub (From Your PC)

```bash
cd C:\Dev\muertos-game
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Step 2: Deploy on Ubuntu Server

SSH into your server:

```bash
ssh e7system@muertos.e7systems.com
```

Then run these commands on the server:

### A. Install Git (if not already installed)
```bash
sudo apt update
sudo apt install git -y
```

### B. Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/E7Systems/muertos-game.git muertos.e7systems.com
```

### C. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
sudo chmod -R 755 /var/www/muertos.e7systems.com
```

### D. Configure Apache
```bash
# Copy the config file from the repo
sudo cp /var/www/muertos.e7systems.com/muertos.e7systems.com.conf /etc/apache2/sites-available/

# Enable the site
sudo a2ensite muertos.e7systems.com.conf

# Enable required modules
sudo a2enmod rewrite headers expires deflate

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

## Step 3: Verify

Open browser to: **http://muertos.e7systems.com**

## Updating the Game (After Changes)

When you make changes and push to GitHub:

```bash
ssh e7system@muertos.e7systems.com
cd /var/www/muertos.e7systems.com
sudo git pull origin main
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
```

## Troubleshooting

**Site not loading?**
```bash
# Check Apache status
sudo systemctl status apache2

# View error logs
sudo tail -50 /var/log/apache2/error.log
```

**Cards not showing?**
```bash
# Check file permissions
ls -la /var/www/muertos.e7systems.com/assets/

# Fix permissions if needed
sudo chown -R www-data:www-data /var/www/muertos.e7systems.com
```

**Apache config issues?**
```bash
# Test config
sudo apache2ctl configtest

# Check enabled sites
ls -la /etc/apache2/sites-enabled/
```

## Quick Reference

```bash
# Connect to server
ssh e7system@muertos.e7systems.com

# Update game
cd /var/www/muertos.e7systems.com && sudo git pull

# Restart Apache
sudo systemctl restart apache2

# View logs
sudo tail -f /var/log/apache2/error.log
```

That's it! Simple GitHub-based deployment.
