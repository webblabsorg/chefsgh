# Ghana Chef Association - Deployment Quick Start

## 🚨 Admin Login Not Working? START HERE! 🚨

**READ THIS FIRST:** [`URGENT_FIX_ADMIN_LOGIN.md`](./URGENT_FIX_ADMIN_LOGIN.md)

This file will guide you through fixing the admin login issue step-by-step.

---

## Overview

The Ghana Chef Association registration system consists of two parts:

1. **Frontend (SPA)** - React app in `dist/` folder
   - Runs on Apache/DirectAdmin (standard PHP hosting)
   - URL: `https://chefsghana.com`
   - Admin panel: `https://chefsghana.com/admin`

2. **Backend (API)** - Node.js server in `api/` folder
   - Needs Node.js 18+ to run
   - Runs on port 4000
   - URL: `https://chefsghana.com/api/*`

**The Problem:** If admin login doesn't work, it's because the Node.js backend isn't running.

---

## Quick Diagnostic

**Step 1:** Visit this URL in your browser:

### 👉 https://chefsghana.com/api/health

**Result A - Server is Running ✅**
```json
{"status":"ok"}
```
→ Server is working! Skip to "Fix Admin Login" below.

**Result B - Server NOT Running ❌**
- 404 error
- "Cannot reach site"
- Connection timeout

→ Node.js server isn't running. Follow Node.js setup guide.

---

## If Server is Running But Login Fails

### Admin Login Credentials

Check your `.env` file on the server for:
```env
ADMIN_SEED_EMAIL=admin@chefsghana.com
ADMIN_SEED_PASSWORD=your-admin-password
```

Use these credentials to login at: `https://chefsghana.com/admin`

### If Login Still Fails

**Option 1: Use Forgot Password**
1. Click "Forgot Password" on login page
2. Enter: `admin@chefsghana.com`
3. Check email for reset link
4. Set new password

**Option 2: Create Admin User Manually**

In phpMyAdmin, run:
```sql
-- Check if admin exists
SELECT * FROM admin_users WHERE email = 'admin@chefsghana.com';

-- If empty, create admin
INSERT INTO admin_users (
  id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
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

Password will be: `your-admin-password`

---

## If Server is NOT Running

You need to get the Node.js API server running. Here are your options:

### Option 1: DirectAdmin Node.js Selector (Easiest)

**If your DirectAdmin has "Node.js Selector":**
1. Open DirectAdmin
2. Find "Node.js Selector" in menu
3. Create new application
4. Point to `api/server/index.js`
5. Start it

**Full guide:** [`DIRECTADMIN_NODE_SETUP.md`](./DIRECTADMIN_NODE_SETUP.md) - Section "Option 1"

### Option 2: PM2 via SSH

**If you have SSH access:**
```bash
cd ~/domains/chefsghana.com/public_html
npm install
npm install -g pm2
npm run pm2:start
pm2 save
```

**Full guide:** [`DIRECTADMIN_NODE_SETUP.md`](./DIRECTADMIN_NODE_SETUP.md) - Section "Option 3"

### Option 3: Contact Your Hosting Provider

**If DirectAdmin doesn't support Node.js:**

Call/email your hosting support:
> "I need to run a Node.js application (version 18+) on my account. The app runs on port 4000 and needs to respond to /api/* requests. Can you help set this up?"

### Option 4: Deploy API to Different Server (Recommended)

**If your hosting can't run Node.js:**

Deploy the API to a Node.js-friendly platform:
- **Render.com** - Free tier, easiest setup
- **Railway.app** - Free tier
- **DigitalOcean App Platform** - $5/month

Then update frontend to point to new API URL.

**Guide:** [`DIRECTADMIN_NODE_SETUP.md`](./DIRECTADMIN_NODE_SETUP.md) - Section "Option 4"

---

## Testing Deployment

### Run Diagnostic Script

If you have SSH access:
```bash
chmod +x check-deployment.sh
./check-deployment.sh
```

This will check:
- Node.js installation
- Project structure
- Environment variables
- Dependencies
- Server status
- Database connection

### Manual Checks

1. **API Health:**
   ```
   https://chefsghana.com/api/health
   → Should return: {"status":"ok"}
   ```

2. **Frontend:**
   ```
   https://chefsghana.com
   → Registration form should load
   ```

3. **Admin Panel:**
   ```
   https://chefsghana.com/admin
   → Login page should load
   ```

4. **Admin Login:**
   - Email: `admin@chefsghana.com`
   - Password: (from .env ADMIN_SEED_PASSWORD)
   - Should successfully login to dashboard

---

## Complete Documentation

| Document | Purpose |
|----------|---------|
| **[URGENT_FIX_ADMIN_LOGIN.md](./URGENT_FIX_ADMIN_LOGIN.md)** | Step-by-step fix for login issues |
| **[DIRECTADMIN_NODE_SETUP.md](./DIRECTADMIN_NODE_SETUP.md)** | Complete Node.js server setup guide |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | Full deployment checklist |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Original deployment documentation |
| **[check-deployment.sh](./check-deployment.sh)** | Automated diagnostic script |

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| `/api/health` returns 404 | Node.js server not running → See DIRECTADMIN_NODE_SETUP.md |
| Admin login fails | Wrong credentials or admin user doesn't exist → See URGENT_FIX_ADMIN_LOGIN.md |
| "Cannot connect to database" | Check MYSQL_* variables in .env |
| Charts don't show | Test: https://chefsghana.com/api/admin/stats |
| CORS errors | Ensure CLIENT_ORIGIN matches your domain |
| 403 Forbidden on admin pages | Check JWT_SECRET is set and matches |

---

## Project Structure

```
chefs/
├── api/                          # Backend (Node.js)
│   ├── server/
│   │   ├── index.js             # Main server file
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   └── middleware/          # Auth, rate limiting, etc.
│   └── uploads/                 # File uploads directory
├── src/                         # Frontend source (React)
│   ├── admin/                   # Admin dashboard pages
│   └── lib/                     # API clients
├── dist/                        # Built frontend (deploy this)
├── .env                         # Environment variables (create this!)
├── .env.example                 # Template for .env
├── package.json                 # Dependencies
├── ecosystem.config.cjs         # PM2 configuration
└── database.sql                 # Database schema
```

---

## What to Upload to Server

### To public_html/ (or domain root):
- **All contents of `dist/` folder** (index.html, assets/, etc.)
- **.htaccess** (for SPA routing)

### To server root (or alongside public_html):
- **api/** folder (entire directory)
- **node_modules/** (or run `npm install` on server)
- **.env** file with production values
- **package.json**
- **ecosystem.config.cjs** (if using PM2)

---

## Environment Variables

**Critical variables you MUST set in .env:**

```env
# Database (from DirectAdmin MySQL)
MYSQL_HOST=localhost
MYSQL_DATABASE=chefs_db
MYSQL_USER=your_db_user
MYSQL_PASSWORD=your_db_password

# Email (from DirectAdmin Email Accounts)
EMAIL_HOST=mail.chefsghana.com
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your_email_password

# Security (generate strong random strings)
JWT_SECRET=your-secret-at-least-32-characters-long

# Admin (for initial login)
ADMIN_SEED_EMAIL=admin@chefsghana.com
ADMIN_SEED_PASSWORD=your-admin-password

# App URL
CLIENT_ORIGIN=https://chefsghana.com
VITE_API_BASE_URL=https://chefsghana.com
NODE_ENV=production
```

See [`.env.example`](./.env.example) for all variables.

---

## Support & Help

### Self-Help Resources
1. Read [`URGENT_FIX_ADMIN_LOGIN.md`](./URGENT_FIX_ADMIN_LOGIN.md) first
2. Run diagnostic script: `./check-deployment.sh`
3. Check browser console for errors (F12 → Console)
4. Check server logs (DirectAdmin → Error Logs)

### Contact Hosting Provider
If Node.js isn't running and you can't start it, contact your DirectAdmin hosting support.

### Alternative: Deploy to Node.js-Friendly Host
If DirectAdmin doesn't support Node.js, deploy the API separately to Render.com (free, easy, 10-minute setup).

---

## Success Checklist

When everything is working:

- ✅ `https://chefsghana.com/api/health` returns `{"status":"ok"}`
- ✅ `https://chefsghana.com` shows registration form
- ✅ `https://chefsghana.com/admin` shows login page
- ✅ Admin login works with credentials
- ✅ Dashboard shows KPIs and charts
- ✅ All admin pages load without errors
- ✅ Can create/edit users
- ✅ Can view registrations and payments

---

## Last Updated
October 2024

---

**Need immediate help?** Start with [`URGENT_FIX_ADMIN_LOGIN.md`](./URGENT_FIX_ADMIN_LOGIN.md)
