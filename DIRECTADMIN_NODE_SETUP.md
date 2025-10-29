# DirectAdmin Node.js Setup Guide

## The Problem
Your admin login fails because the API server (Node.js) isn't running. The `/api/health` endpoint returns 404 because there's no server responding to API requests.

## Solution Overview
You need to:
1. Get Node.js running on DirectAdmin
2. Configure the server to start automatically
3. Set up proper routing between the frontend (Apache/PHP) and backend (Node.js)

---

## Option 1: DirectAdmin Node.js Selector (Recommended if Available)

### Check if DirectAdmin Has Node.js Support

1. Log in to DirectAdmin
2. Look for "**Node.js Selector**" or "**Node.js Setup**" in the menu
3. If you don't see it, your hosting doesn't support Node.js apps (skip to Option 2)

### Set Up Node.js App

If Node.js Selector exists:

1. **Open Node.js Selector**
2. **Create New Application:**
   - **Application Root:** `/home/username/domains/chefsghana.com/public_html/api`
   - **Application URL:** `https://chefsghana.com` (or leave blank)
   - **Application Startup File:** `server/index.js`
   - **Node.js Version:** 18 or higher
   - **Environment:** Production

3. **Set Environment Variables:**
   Click "Environment Variables" and add all from your `.env` file:
   ```
   API_PORT=4000
   CLIENT_ORIGIN=https://chefsghana.com
   MYSQL_HOST=localhost
   MYSQL_DATABASE=chefs_db
   MYSQL_USER=your_db_user
   MYSQL_PASSWORD=your_db_password
   EMAIL_HOST=mail.chefsghana.com
   EMAIL_PORT=587
   EMAIL_USER=info@chefsghana.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=info@chefsghana.com
   ADMIN_EMAIL=admin@chefsghana.com
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ADMIN_SEED_EMAIL=admin@chefsghana.com
   ADMIN_SEED_PASSWORD=chefsgh8195
   NODE_ENV=production
   APP_URL=https://chefsghana.com
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE
   PAYSTACK_SECRET_KEY=sk_test_your-secret-key
   ```

4. **Install Dependencies:**
   In the Node.js Selector interface, look for "NPM Install" button or similar
   Or use DirectAdmin terminal/SSH: `cd ~/domains/chefsghana.com/public_html/api && npm install`

5. **Start the Application**
   Click "Start" or "Restart" button

6. **Verify It's Running:**
   Visit: `https://chefsghana.com/api/health`
   Should return: `{"status":"ok"}`

---

## Option 2: Using Passenger (If DirectAdmin Uses Passenger)

Many DirectAdmin servers use Passenger for Node.js apps.

### 1. Create Passenger Configuration

Upload this file to `public_html/api/passenger_wsgi.py`:

```python
import os
import sys

# Point to your Node.js app
INTERP = "/usr/bin/node"
APP_DIR = os.path.dirname(__file__)

if sys.executable != INTERP:
    os.execl(INTERP, INTERP, os.path.join(APP_DIR, "server/index.js"))
```

Or create `public_html/api/tmp/restart.txt` (empty file):
```bash
touch api/tmp/restart.txt
```

### 2. Configure Apache Proxy

Ask your hosting provider to enable proxy pass, or if you have access, create `.htaccess` in `public_html`:

```apache
# Proxy API requests to Node.js
RewriteEngine On

# Proxy /api requests to Node.js on port 4000
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]

# SPA fallback for /admin
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/admin
RewriteRule ^ /index.html [L]
```

---

## Option 3: Manual Setup via SSH (If You Have Terminal Access)

If you can access SSH/terminal through DirectAdmin:

### 1. Install Dependencies

```bash
cd ~/domains/chefsghana.com/public_html
npm install
```

### 2. Start Server Manually

```bash
node api/server/index.js
```

This will start the server, but it will stop when you close the terminal.

### 3. Use PM2 for Auto-Restart (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
cd ~/domains/chefsghana.com/public_html
pm2 start api/server/index.js --name chefs-api

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status
```

### 4. Verify Server Running

```bash
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

---

## Option 4: If DirectAdmin Doesn't Support Node.js

If your hosting doesn't support Node.js at all, you have two options:

### A. Contact Your Hosting Provider

Ask them to:
1. Install Node.js (version 18+)
2. Set up a proxy from Apache to your Node.js app on port 4000
3. Enable PM2 or similar process manager

### B. Migrate to Node.js-Friendly Hosting

Consider these DirectAdmin-compatible hosts that support Node.js:
- **Cloudways** (DigitalOcean + DirectAdmin)
- **A2 Hosting** (supports Node.js apps)
- **InMotion Hosting** (has Node.js support)
- **DigitalOcean Droplet** with DirectAdmin panel installed

Or use a separate Node.js hosting for the API:
- **Render.com** (free tier available)
- **Railway.app** (free tier)
- **Heroku** (paid)
- **DigitalOcean App Platform**

---

## After Server is Running: Fix Admin Login

Once `/api/health` returns `{"status":"ok"}`, fix the admin login:

### 1. Verify Admin User Exists

In phpMyAdmin:

```sql
SELECT * FROM admin_users WHERE email = 'admin@chefsghana.com';
```

If empty, the seed didn't run. Insert manually:

```sql
INSERT INTO admin_users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  UUID(),
  'admin',
  'admin@chefsghana.com',
  '$2a$10$rZ9QXJ1h.VZxG3FZFvJJUO5YVZ5yX3R0RZ3VzJJUO5YVZ5yX3R0RZ',
  'Administrator',
  'admin',
  1,
  NOW(),
  NOW()
);
```

### 2. Test Login

1. Go to: `https://chefsghana.com/admin`
2. Enter credentials:
   - **Email:** `admin@chefsghana.com`
   - **Password:** `chefsgh8195`
3. If login fails, check browser console (F12) for errors

### 3. Use "Forgot Password" (Alternative)

1. Click "Forgot Password" on login page
2. Enter: `admin@chefsghana.com`
3. Check email for reset link
4. Set new password

---

## Troubleshooting

### API Returns 404

**Cause:** Node.js server isn't running

**Solutions:**
1. Check server status in DirectAdmin Node.js Selector
2. If using PM2: `pm2 status` and `pm2 logs`
3. Check server logs for errors
4. Verify port 4000 isn't blocked by firewall

### Can't Access Admin Panel

**Cause:** Apache isn't rewriting /admin routes

**Solution:** Add to `.htaccess` in `public_html`:
```apache
RewriteEngine On

# Serve admin SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/admin
RewriteRule ^ /index.html [L]
```

### Login Fails with Correct Password

**Cause:** JWT secret mismatch or cookie issues

**Solutions:**
1. Clear browser cookies
2. Try incognito/private mode
3. Verify JWT_SECRET in environment variables matches .env
4. Check browser console for CORS errors

### Database Connection Error

**Cause:** Wrong credentials or MySQL not accessible from Node.js

**Solutions:**
1. Verify MYSQL_* variables in environment
2. Test connection in phpMyAdmin
3. Ensure MySQL user has remote access if needed:
   ```sql
   GRANT ALL ON chefs_db.* TO 'user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## Quick Verification Checklist

Once setup is complete:

- [ ] `https://chefsghana.com/api/health` returns `{"status":"ok"}`
- [ ] `https://chefsghana.com/admin` loads the login page
- [ ] Admin login works with credentials
- [ ] Dashboard shows KPIs and charts
- [ ] All admin pages accessible (Users, Registrations, Payments, etc.)

---

## Next Steps After Server is Running

1. **Test all admin features:**
   - Create/edit users
   - View registrations
   - Review payments
   - Manage membership types

2. **Set up monitoring:**
   - Configure PM2 monitoring if using PM2
   - Set up email alerts for server downtime
   - Monitor logs regularly

3. **Security:**
   - Change default admin password
   - Use strong JWT_SECRET
   - Enable HTTPS only
   - Keep Node.js and dependencies updated

---

## Need Help?

**First, determine which option applies to your hosting:**
1. Check if DirectAdmin has "Node.js Selector"
2. If not, check if you have SSH access
3. If neither, contact your hosting provider

**Contact your hosting provider and ask:**
- "Does DirectAdmin support Node.js applications?"
- "Can you help me set up a Node.js app running on port 4000?"
- "Can you configure Apache to proxy /api requests to localhost:4000?"
