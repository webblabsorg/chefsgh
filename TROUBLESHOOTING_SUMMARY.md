# Troubleshooting Summary - Admin Login Issue

## Problem Statement

**User cannot login to the admin dashboard at https://chefsghana.com/admin**

### Root Cause Analysis

The admin login fails because the **Node.js API server is not running** on the DirectAdmin hosting server.

Evidence:
- `/api/health` endpoint returns 404 error
- All `/api/*` requests fail
- Frontend (HTML/CSS/JS) loads correctly
- Backend (Node.js API) is not responding

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  DirectAdmin Hosting (chefsghana.com)          │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  Apache/PHP (Port 80/443)              │   │
│  │  - Serves static files (dist/)         │   │
│  │  - Frontend: /                          │   │
│  │  - Admin SPA: /admin                    │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  Node.js Server (Port 4000) ❌ NOT     │   │
│  │  RUNNING                                │   │
│  │  - API endpoints: /api/*                │   │
│  │  - Authentication                       │   │
│  │  - Database operations                  │   │
│  │  - Admin operations                     │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  MySQL Database (phpMyAdmin)           │   │
│  │  - admin_users table                    │   │
│  │  - registrations, payments, etc.        │   │
│  └────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Solutions Provided

### Solution 1: DirectAdmin Node.js Selector
**File:** `DIRECTADMIN_NODE_SETUP.md` - Option 1
- Use DirectAdmin's built-in Node.js management
- Configure application root, startup file, environment
- Start server with one click
- **Best if available**

### Solution 2: PM2 Process Manager (via SSH)
**File:** `DIRECTADMIN_NODE_SETUP.md` - Option 3
- Install PM2 globally on server
- Start server with auto-restart on crashes
- Persist across server reboots
- Monitor logs easily
- **Best if you have SSH access**

### Solution 3: Contact Hosting Provider
**File:** `DIRECTADMIN_NODE_SETUP.md` - Option 1 (end section)
- Request Node.js support
- Ask for proxy configuration
- Simplest if non-technical
- **Best if hosting doesn't support Node.js**

### Solution 4: Deploy API Separately
**File:** `DIRECTADMIN_NODE_SETUP.md` - Option 4
- Use Render.com, Railway.app, or similar
- Free tier available
- Much simpler than DirectAdmin setup
- Update frontend to point to new API URL
- **Best if DirectAdmin Node.js support unavailable**

## Files Created

### Primary Documentation
1. **`README_DEPLOYMENT.md`**
   - Quick start guide
   - Links to all other resources
   - Common issues & fixes

2. **`URGENT_FIX_ADMIN_LOGIN.md`**
   - Step-by-step troubleshooting
   - Immediate action items
   - Emergency procedures

3. **`DIRECTADMIN_NODE_SETUP.md`**
   - Complete Node.js setup guide
   - Multiple deployment options
   - Detailed instructions for each method

4. **`DEPLOYMENT_CHECKLIST.md`**
   - Comprehensive deployment checklist
   - Pre-deployment tasks
   - Post-deployment verification
   - Security checklist

### Scripts & Tools
5. **`check-deployment.sh`**
   - Automated diagnostic script
   - Checks Node.js, dependencies, env vars
   - Tests server status
   - Bash script for Linux/Mac

6. **`start-server.bat`**
   - Windows batch file to start server
   - Checks dependencies
   - Validates environment
   - Starts server with error handling

7. **`api/server/start.sh`**
   - Linux/Mac shell script to start server
   - Loads .env variables
   - Starts Node.js server

8. **`ecosystem.config.cjs`**
   - PM2 configuration file
   - Process management settings
   - Log file paths
   - Auto-restart configuration

### Updated Files
9. **`package.json`**
   - Added `start` script for production
   - Added PM2 management scripts
   - Scripts: `pm2:start`, `pm2:stop`, `pm2:restart`, `pm2:logs`

## Admin Login Fix Steps

### Step 1: Verify Server Status
```bash
curl https://chefsghana.com/api/health
```
Expected: `{"status":"ok"}`
Actual: 404 error (server not running)

### Step 2: Start Node.js Server
Choose appropriate method from DIRECTADMIN_NODE_SETUP.md based on hosting capabilities.

### Step 3: Verify Admin User Exists
```sql
SELECT * FROM admin_users WHERE email = 'admin@chefsghana.com';
```

If empty, create admin:
```sql
INSERT INTO admin_users (
  id, username, email, password_hash, full_name, role, is_active, created_at, updated_at
) VALUES (
  UUID(), 'admin', 'admin@chefsghana.com',
  '$2a$10$rZ9QXJ1h.VZxG3FZFvJJUO5YVZ5yX3R0RZ3VzJJUO5YVZ5yX3R0RZ',
  'Administrator', 'admin', 1, NOW(), NOW()
);
```

### Step 4: Test Login
- URL: `https://chefsghana.com/admin`
- Email: `admin@chefsghana.com`
- Password: `your-admin-password` (default from .env)

## Technical Requirements

### Server Requirements
- **Node.js:** 18.x or higher
- **NPM:** 8.x or higher
- **MySQL:** 5.7+ or 8.x
- **Memory:** 512MB minimum (1GB recommended)
- **Storage:** 500MB for node_modules + uploads

### Network Requirements
- **Port 4000:** Open for Node.js server
- **Port 3306:** MySQL (localhost only)
- **Port 587:** SMTP for emails
- **SSL/TLS:** Certificate installed for HTTPS

### DirectAdmin Requirements
- **Node.js Selector** (if available)
- **SSH Access** (for manual setup)
- **MySQL Management** (phpMyAdmin)
- **Email Accounts** (for notifications)

## Environment Variables Checklist

Critical variables that MUST be set:

```env
# Database
MYSQL_HOST=localhost                    # ✓ Required
MYSQL_DATABASE=chefs_db                 # ✓ Required
MYSQL_USER=your_db_user                 # ✓ Required
MYSQL_PASSWORD=your_db_password         # ✓ Required

# Email
EMAIL_HOST=mail.chefsghana.com          # ✓ Required
EMAIL_PORT=587                          # ✓ Required
EMAIL_USER=info@chefsghana.com          # ✓ Required
EMAIL_PASSWORD=your_email_password      # ✓ Required
EMAIL_FROM=info@chefsghana.com          # ✓ Required

# Security
JWT_SECRET=min-32-chars-random-string   # ✓ Required

# Admin Seed
ADMIN_SEED_EMAIL=admin@chefsghana.com   # ✓ Required
ADMIN_SEED_PASSWORD=your-admin-password         # ✓ Required

# Application
CLIENT_ORIGIN=https://chefsghana.com    # ✓ Required
VITE_API_BASE_URL=https://chefsghana.com # ✓ Required
NODE_ENV=production                     # ✓ Required
API_PORT=4000                           # ✓ Required
```

## Verification Tests

### 1. API Health Check
```bash
curl https://chefsghana.com/api/health
# Expected: {"status":"ok"}
```

### 2. Admin Stats Endpoint
```bash
curl -H "Authorization: Bearer <token>" \
  https://chefsghana.com/api/admin/stats
# Expected: JSON with totalUsers, totalRegistrations, etc.
```

### 3. Frontend Load Test
- Visit: `https://chefsghana.com`
- Check: Registration form loads
- Verify: No console errors (F12)

### 4. Admin Panel Load Test
- Visit: `https://chefsghana.com/admin`
- Check: Login page displays
- Verify: No console errors (F12)

### 5. Admin Login Test
- Enter credentials
- Check: Redirects to dashboard
- Verify: KPIs and charts display
- Test: Navigate to Users, Registrations, Payments

## Common Error Messages & Solutions

### "Cannot GET /api/health" (404)
**Cause:** Node.js server not running
**Solution:** Start Node.js server (see DIRECTADMIN_NODE_SETUP.md)

### "Login failed: Invalid credentials"
**Cause:** Wrong password or admin user doesn't exist
**Solution:** 
1. Check ADMIN_SEED_PASSWORD in .env
2. Verify admin_users table has entry
3. Use "Forgot Password" feature

### "Database connection failed"
**Cause:** Wrong MySQL credentials
**Solution:** Verify MYSQL_* variables in .env match phpMyAdmin

### "CORS policy: No 'Access-Control-Allow-Origin'"
**Cause:** CLIENT_ORIGIN mismatch
**Solution:** Ensure CLIENT_ORIGIN in .env exactly matches your domain

### "Failed to fetch"
**Cause:** API server not reachable from frontend
**Solution:** 
1. Check API server is running
2. Verify VITE_API_BASE_URL in .env
3. Check Apache proxy configuration

## Monitoring & Maintenance

### Daily Checks
- [ ] Verify API server is running: `/api/health`
- [ ] Check admin login works
- [ ] Review error logs

### Weekly Checks
- [ ] Review audit logs in database
- [ ] Check disk space usage
- [ ] Verify backups completed

### Monthly Checks
- [ ] Update Node.js dependencies: `npm update`
- [ ] Review and rotate logs
- [ ] Test backup restoration

## Backup Strategy

### What to Backup
1. **Database:** Full MySQL dump daily
2. **Uploads:** Files in `api/uploads/` directory
3. **Configuration:** `.env` file (securely)
4. **Source Code:** `api/` and `dist/` directories

### Backup Commands
```bash
# Database backup
mysqldump -u user -p chefs_db > backup_$(date +%Y%m%d).sql

# File backup
tar -czf backup_files_$(date +%Y%m%d).tar.gz api/uploads/

# Full backup
tar -czf backup_full_$(date +%Y%m%d).tar.gz api/ dist/ .env
```

## Rollback Plan

If deployment fails:

1. **Stop new server:**
   ```bash
   pm2 stop chefs-api
   # or via DirectAdmin Node.js Selector
   ```

2. **Restore database:**
   ```bash
   mysql -u user -p chefs_db < backup_20241028.sql
   ```

3. **Restore files:**
   ```bash
   tar -xzf backup_files_20241028.tar.gz
   ```

4. **Restart old version:**
   ```bash
   pm2 start ecosystem.config.cjs
   ```

## Success Criteria

Deployment is successful when:

- ✅ API health endpoint returns 200 OK
- ✅ Admin login works with credentials
- ✅ Dashboard displays KPIs and charts
- ✅ All CRUD operations work (Users, Registrations, etc.)
- ✅ No errors in browser console
- ✅ No errors in server logs
- ✅ Email notifications send correctly
- ✅ CSV export/import functions
- ✅ Server stays running after 24 hours

## Next Steps

1. **Immediate:** Get Node.js server running (choose method from docs)
2. **Short-term:** Test all admin functionality
3. **Medium-term:** Set up monitoring and alerts
4. **Long-term:** Automate backups and updates

## Resources

### Internal Documentation
- `README_DEPLOYMENT.md` - Start here
- `URGENT_FIX_ADMIN_LOGIN.md` - Immediate fixes
- `DIRECTADMIN_NODE_SETUP.md` - Complete setup guide
- `DEPLOYMENT_CHECKLIST.md` - Full checklist
- `check-deployment.sh` - Diagnostic script

### External Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [DirectAdmin Documentation](https://docs.directadmin.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## Contact & Support

### For Technical Issues
1. Read documentation in order listed above
2. Run diagnostic script: `./check-deployment.sh`
3. Check browser console and server logs
4. Contact hosting provider if Node.js won't start

### For Hosting Questions
- Contact your DirectAdmin hosting provider
- Ask about Node.js support capabilities
- Request help with proxy configuration

### Alternative Deployment
If DirectAdmin proves too difficult:
- Deploy API to Render.com (free, easy)
- Keep frontend on DirectAdmin
- Update API_BASE_URL to point to Render

---

**Last Updated:** October 28, 2024
**Status:** Documentation complete, awaiting server deployment
