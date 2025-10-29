# Files Created for Troubleshooting Admin Login Issue

This document lists all files created to help troubleshoot and fix the admin login issue on https://chefsghana.com/admin

## 📁 Created Files Overview

### 1. Primary Documentation (Read These First!)

#### `README_DEPLOYMENT.md`
**Purpose:** Quick start guide and central hub for all documentation  
**When to use:** Start here - provides overview and links to other resources  
**Key sections:**
- Quick diagnostic steps
- Links to all other guides
- Common issues & fixes
- Project structure overview

#### `URGENT_FIX_ADMIN_LOGIN.md`
**Purpose:** Step-by-step troubleshooting for admin login failure  
**When to use:** When you can't login to admin panel  
**Key sections:**
- Diagnosis steps (check if server is running)
- 4 different solutions based on hosting capabilities
- Admin user creation in database
- Login credential verification

#### `QUICK_REFERENCE.txt`
**Purpose:** One-page quick reference card (plain text, no markdown)  
**When to use:** Print this out or keep it open while working  
**Key sections:**
- Quick diagnostic test
- Server startup commands
- Admin login credentials
- Common errors and fixes

---

### 2. Setup & Configuration Guides

#### `DIRECTADMIN_NODE_SETUP.md`
**Purpose:** Complete guide for getting Node.js running on DirectAdmin  
**When to use:** When API server isn't running (404 on /api/health)  
**Key sections:**
- Option 1: DirectAdmin Node.js Selector
- Option 2: Passenger configuration
- Option 3: Manual setup via SSH + PM2
- Option 4: Deploy API to different server (Render.com)
- Troubleshooting for each method

#### `DEPLOYMENT_CHECKLIST.md`
**Purpose:** Comprehensive deployment checklist with verification steps  
**When to use:** When deploying for first time or verifying deployment  
**Key sections:**
- Pre-deployment tasks (local)
- DirectAdmin setup (database, email, files)
- Node.js setup (multiple methods)
- Apache configuration (.htaccess)
- Verification tests
- Security checklist
- Post-deployment monitoring

#### `TROUBLESHOOTING_SUMMARY.md`
**Purpose:** Complete technical summary of the problem and all solutions  
**When to use:** For comprehensive understanding of the issue  
**Key sections:**
- Problem statement and root cause
- System architecture diagram
- All solution methods detailed
- Environment variables checklist
- Verification tests
- Monitoring and maintenance
- Backup and rollback procedures

---

### 3. Scripts & Tools

#### `check-deployment.sh`
**Purpose:** Automated diagnostic script for Linux/Mac  
**When to use:** Run on server via SSH to check deployment status  
**What it checks:**
- Node.js installation and version
- Project structure and files
- Environment variables (.env)
- Dependencies (node_modules)
- Server status (is it running?)
- PM2 status (if installed)
- MySQL availability

**How to use:**
```bash
chmod +x check-deployment.sh
./check-deployment.sh
```

#### `start-server.bat`
**Purpose:** Windows batch script to start the server  
**When to use:** Testing locally on Windows  
**What it does:**
- Checks Node.js installation
- Installs dependencies if needed
- Validates .env file exists
- Builds frontend if needed
- Starts the server

**How to use:**
```
Double-click start-server.bat
```

#### `api/server/start.sh`
**Purpose:** Linux/Mac shell script to start the server  
**When to use:** On server or local Linux/Mac  
**What it does:**
- Loads environment variables from .env
- Sets NODE_ENV=production
- Starts Node.js server

**How to use:**
```bash
chmod +x api/server/start.sh
./api/server/start.sh
```

#### `ecosystem.config.cjs`
**Purpose:** PM2 process manager configuration  
**When to use:** When using PM2 to run the server  
**What it configures:**
- App name: chefs-api
- Entry point: api/server/index.js
- Auto-restart settings
- Memory limits
- Log file locations

**How to use:**
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

---

### 4. Interactive Testing Tools

#### `test-deployment.html`
**Purpose:** HTML page with clickable links to test all endpoints  
**When to use:** Open in browser to visually test deployment  
**Features:**
- Clickable test links for all endpoints
- Auto-tests API health and membership types
- Visual status indicators (✅ Online / ❌ Offline)
- Admin credentials displayed
- Links to all documentation
- What to check after testing

**How to use:**
1. Open test-deployment.html in web browser
2. Click test links to verify each endpoint
3. Follow troubleshooting steps if tests fail

---

### 5. Updated Files

#### `package.json` (Updated)
**Changes made:**
- Added `"start"` script for production: `NODE_ENV=production node api/server/index.js`
- Added PM2 management scripts:
  - `"pm2:start"` - Start with PM2
  - `"pm2:stop"` - Stop PM2 process
  - `"pm2:restart"` - Restart PM2 process
  - `"pm2:logs"` - View PM2 logs

---

## 📊 File Usage Flow Chart

```
START HERE
    ↓
README_DEPLOYMENT.md
    ↓
Is /api/health working?
    ↓
NO ──→ DIRECTADMIN_NODE_SETUP.md
    │       ↓
    │   Choose setup method:
    │   - Node.js Selector
    │   - PM2 (use ecosystem.config.cjs)
    │   - Contact hosting
    │   - Deploy to Render.com
    │       ↓
    │   Server running!
    │       ↓
    └───────┘
        ↓
YES → Can you login?
    ↓
NO ──→ URGENT_FIX_ADMIN_LOGIN.md
        ↓
    Fix admin user
        ↓
    Login works!
        ↓
    ✅ COMPLETE
```

---

## 🎯 Quick Decision Tree

### "I can't login to admin panel"

**Question 1:** Does https://chefsghana.com/api/health return `{"status":"ok"}`?

**NO** → Node.js server isn't running
- Read: `DIRECTADMIN_NODE_SETUP.md`
- Or: `URGENT_FIX_ADMIN_LOGIN.md` → Step 1

**YES** → Server is running, login issue
- Read: `URGENT_FIX_ADMIN_LOGIN.md` → Step 2
- Or: Use "Forgot Password" feature

---

### "I'm deploying for the first time"

1. Read: `README_DEPLOYMENT.md` (overview)
2. Follow: `DEPLOYMENT_CHECKLIST.md` (step-by-step)
3. Setup server: `DIRECTADMIN_NODE_SETUP.md`
4. Verify: Open `test-deployment.html` in browser

---

### "I want to diagnose issues"

**On server (SSH access):**
```bash
./check-deployment.sh
```

**In browser:**
- Open: `test-deployment.html`
- Click test links
- Check status indicators

**Manual checks:**
- https://chefsghana.com/api/health
- https://chefsghana.com/admin
- Browser console (F12 → Console)

---

## 📋 File Categories

### Must Read (Start Here)
1. ✅ `QUICK_REFERENCE.txt` - 1-page cheatsheet
2. ✅ `README_DEPLOYMENT.md` - Overview & links
3. ✅ `URGENT_FIX_ADMIN_LOGIN.md` - Fix login now

### Setup Guides (When Deploying)
4. `DIRECTADMIN_NODE_SETUP.md` - Get server running
5. `DEPLOYMENT_CHECKLIST.md` - Complete checklist
6. `TROUBLESHOOTING_SUMMARY.md` - Technical details

### Tools (For Testing & Automation)
7. `check-deployment.sh` - Diagnostic script
8. `test-deployment.html` - Browser-based testing
9. `start-server.bat` - Windows startup script
10. `api/server/start.sh` - Linux/Mac startup script
11. `ecosystem.config.cjs` - PM2 configuration

---

## 💾 Files to Upload to Server

### Essential Files (Must Upload)
- ✅ `api/` - Entire directory with server code
- ✅ `dist/` - Built frontend files
- ✅ `.env` - Environment configuration (create from .env.example)
- ✅ `package.json` - Dependencies list

### Helpful Files (Recommended)
- `ecosystem.config.cjs` - If using PM2
- `check-deployment.sh` - For diagnostics
- `api/server/start.sh` - For manual startup

### Documentation Files (Optional, for reference)
- All .md files for future reference
- `test-deployment.html` for testing

---

## 🔑 Key Information Locations

### Admin Credentials
- **Default email:** `admin@chefsghana.com`
- **Default password:** `your-admin-password`
- **Configured in:** `.env` file (ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD)
- **Stored in:** Database table `admin_users`

### Database Connection
- **Configured in:** `.env` file (MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD)
- **Access via:** DirectAdmin → phpMyAdmin
- **Database name:** `chefs_db` (or as configured)

### API Endpoints
- **Health check:** `/api/health`
- **Admin login:** `/api/auth/login`
- **Admin stats:** `/api/admin/stats`
- **All admin APIs:** `/api/admin/*`

### Server Configuration
- **Node.js version required:** 18+
- **Server port:** 4000 (configured via API_PORT in .env)
- **Entry point:** `api/server/index.js`
- **Environment:** Production (NODE_ENV=production)

---

## 🆘 Emergency Contacts & Resources

### If Stuck on Server Setup
1. Read: `DIRECTADMIN_NODE_SETUP.md` → Option 4 (Deploy to Render.com)
2. Contact: Your DirectAdmin hosting provider support
3. Ask provider: "Can you help me run a Node.js application on port 4000?"

### If Stuck on Admin Login
1. Use: "Forgot Password" feature on login page
2. Check: `.env` file for correct credentials
3. Verify: `admin_users` table in phpMyAdmin
4. Follow: `URGENT_FIX_ADMIN_LOGIN.md` step-by-step

### Alternative Solutions
- Deploy API to **Render.com** (free, easier than DirectAdmin)
- Use **Railway.app** (free tier available)
- Try **DigitalOcean App Platform** ($5/month)

---

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ https://chefsghana.com/api/health returns `{"status":"ok"}`
2. ✅ https://chefsghana.com loads registration form
3. ✅ https://chefsghana.com/admin loads login page
4. ✅ Admin login works with credentials
5. ✅ Dashboard displays KPIs and charts
6. ✅ All admin pages accessible (Users, Registrations, Payments, etc.)
7. ✅ No errors in browser console
8. ✅ Server stays running continuously

---

## 📝 Summary

**Total files created:** 11 new files + 1 updated file

**Primary documentation:** 3 files  
**Setup guides:** 3 files  
**Scripts & tools:** 4 files  
**Interactive testing:** 1 file

**Start with:** `QUICK_REFERENCE.txt` or `README_DEPLOYMENT.md`

**For login issues:** `URGENT_FIX_ADMIN_LOGIN.md`

**For server setup:** `DIRECTADMIN_NODE_SETUP.md`

---

**Last Updated:** October 28, 2024  
**Purpose:** Comprehensive troubleshooting resources for Ghana Chef Association admin dashboard deployment
