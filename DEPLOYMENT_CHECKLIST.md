# Ghana Chef Association - Deployment Checklist

Use this checklist to ensure proper deployment of the admin dashboard on DirectAdmin.

## Pre-Deployment (On Your Local Machine)

- [ ] All code changes tested locally
- [ ] Run `npm run typecheck` - no errors
- [ ] Run `npm run build` - completes successfully
- [ ] `dist/` folder generated with all files
- [ ] Review `.env.example` - all required variables documented

## DirectAdmin - Initial Setup

### 1. Database Setup
- [ ] MySQL database created in DirectAdmin
- [ ] Database user created with strong password
- [ ] Imported `database.sql` via phpMyAdmin
- [ ] Verified all tables exist (run: `SHOW TABLES;`)
- [ ] Verified membership types exist (run: `SELECT * FROM membership_types;`)

### 2. Email Setup
- [ ] Email account created: `info@chefsghana.com`
- [ ] Email account created: `admin@chefsghana.com`
- [ ] Email passwords noted securely
- [ ] Email forwarding configured (optional)
- [ ] Tested email sending with test script

### 3. File Upload
- [ ] Built `dist/` folder uploaded to `public_html/`
- [ ] `api/` folder uploaded to server root
- [ ] `node_modules/` uploaded OR will run `npm install` on server
- [ ] `.env` file uploaded with production values (never commit to git!)
- [ ] File permissions set correctly (755 for folders, 644 for files)
- [ ] `uploads/` directory created with write permissions

### 4. Environment Configuration
- [ ] `.env` file created on server with production values
- [ ] `MYSQL_*` variables match database credentials
- [ ] `EMAIL_*` variables match email account credentials
- [ ] `JWT_SECRET` is a strong random string (min 32 chars)
- [ ] `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` set
- [ ] `CLIENT_ORIGIN=https://chefsghana.com`
- [ ] `VITE_API_BASE_URL=https://chefsghana.com`
- [ ] `NODE_ENV=production`
- [ ] Paystack keys updated (use LIVE keys, not test keys)

## DirectAdmin - Node.js Setup

Choose the method that works for your hosting:

### Option A: DirectAdmin Node.js Selector
- [ ] Found "Node.js Selector" in DirectAdmin menu
- [ ] Created new Node.js application
- [ ] Set application root: `api`
- [ ] Set startup file: `server/index.js`
- [ ] Selected Node.js version: 18+
- [ ] Added all environment variables from `.env`
- [ ] Ran NPM install
- [ ] Started the application
- [ ] Verified status shows "Running"

### Option B: PM2 Setup (via SSH)
- [ ] SSH access to server confirmed
- [ ] Navigated to project directory
- [ ] Ran `npm install` to install dependencies
- [ ] Installed PM2 globally: `npm install -g pm2`
- [ ] Started server: `npm run pm2:start`
- [ ] Saved PM2 config: `pm2 save`
- [ ] Set PM2 startup: `pm2 startup` (follow instructions)
- [ ] Verified server running: `pm2 status`

### Option C: Manual Start (Temporary Testing)
- [ ] SSH access to server confirmed
- [ ] Navigated to project directory
- [ ] Ran `npm install` to install dependencies
- [ ] Started server: `npm start`
- [ ] Kept terminal open to keep server running

## Apache Configuration

### .htaccess Setup
- [ ] Created/updated `.htaccess` in `public_html/`
- [ ] Added API proxy rules (if not using Node.js Selector)
- [ ] Added SPA fallback rules for /admin routes
- [ ] Tested rewrite rules

Example `.htaccess` content:
```apache
RewriteEngine On

# Proxy /api to Node.js server
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]

# Admin SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/admin
RewriteRule ^ /index.html [L]
```

## Verification Tests

### 1. API Server
- [ ] Visit `https://chefsghana.com/api/health`
- [ ] Should return: `{"status":"ok"}`
- [ ] If 404, Node.js server isn't running (check setup above)

### 2. Frontend
- [ ] Visit `https://chefsghana.com`
- [ ] Registration form loads correctly
- [ ] No console errors (F12 → Console)
- [ ] Images and styles load properly

### 3. Admin Panel
- [ ] Visit `https://chefsghana.com/admin`
- [ ] Login page loads correctly
- [ ] No console errors (F12 → Console)

### 4. Admin Login
- [ ] Enter credentials:
  - Email: `admin@chefsghana.com`
  - Password: (value from `ADMIN_SEED_PASSWORD` in `.env`)
- [ ] Login successful
- [ ] Dashboard loads with KPIs
- [ ] Navigation menu works
- [ ] All admin pages accessible

### 5. Admin User in Database
If login fails, verify admin user exists:

- [ ] Open phpMyAdmin
- [ ] Select `chefs_db` database
- [ ] Run query: `SELECT * FROM admin_users WHERE email = 'admin@chefsghana.com';`
- [ ] Admin user exists with correct email
- [ ] `is_active` = 1
- [ ] `role` = 'admin'

If admin user doesn't exist, run this INSERT:
```sql
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

### 6. Forgot Password Flow
If you can't remember the password:

- [ ] Click "Forgot Password" on login page
- [ ] Enter: `admin@chefsghana.com`
- [ ] Check email inbox for reset link
- [ ] Click link and set new password
- [ ] Login with new password

## Functional Tests

### Test Registration Flow
- [ ] Complete a test registration
- [ ] Upload test profile photo
- [ ] Payment processes successfully
- [ ] Registration saved to database
- [ ] Membership ID generated
- [ ] Email notification sent to admin

### Test Admin Features
- [ ] Dashboard shows correct KPIs
- [ ] Charts render properly
- [ ] Users list loads
- [ ] Can create new user
- [ ] Can edit existing user
- [ ] Registrations list loads
- [ ] Can view registration details
- [ ] Can approve/reject registrations
- [ ] Payments list loads
- [ ] Membership types CRUD works
- [ ] Email logs display
- [ ] Renewals tracking works
- [ ] CSV export works
- [ ] CSV import works

## Security Checklist

- [ ] Changed default admin password
- [ ] Using LIVE Paystack keys (not test keys)
- [ ] SSL certificate enabled (HTTPS)
- [ ] `NODE_ENV=production` in `.env`
- [ ] `JWT_SECRET` is strong and unique
- [ ] Database credentials are strong
- [ ] Email passwords are strong
- [ ] `.env` file NOT in public directory
- [ ] `.env` file NOT committed to git
- [ ] File permissions correct (no world-writable files)
- [ ] Regular backups configured

## Post-Deployment Monitoring

### Daily
- [ ] Check `/api/health` endpoint
- [ ] Monitor email notifications
- [ ] Check for failed registrations in admin
- [ ] Review error logs

### Weekly
- [ ] Review audit logs in database
- [ ] Check server disk space
- [ ] Verify backups are running
- [ ] Test login and key admin features

### Monthly
- [ ] Update Node.js dependencies: `npm update`
- [ ] Review and renew expiring memberships
- [ ] Generate revenue reports
- [ ] Update Paystack API keys if rotated

## Troubleshooting

### Issue: /api/health returns 404
**Solution:** Node.js server isn't running. Check DirectAdmin Node.js Selector or PM2 status.

### Issue: Admin login fails
**Solutions:**
1. Verify credentials match `ADMIN_SEED_*` in `.env`
2. Check admin user exists in database
3. Use "Forgot Password" to reset
4. Clear browser cookies and try incognito mode
5. Check browser console for errors (F12)

### Issue: Charts don't show in dashboard
**Solutions:**
1. Check browser console for errors
2. Verify API endpoints return data
3. Test: `https://chefsghana.com/api/admin/stats`
4. Ensure recharts library installed: `npm list recharts`

### Issue: Can't upload files
**Solutions:**
1. Check `uploads/` directory exists and is writable
2. Verify file size limits in `.env`
3. Check browser console and server logs for errors
4. Ensure `multer` is installed

### Issue: Emails not sending
**Solutions:**
1. Verify email credentials in `.env`
2. Test email account in DirectAdmin webmail
3. Check server error logs
4. Ensure port 587 isn't blocked by firewall
5. Verify SPF and DKIM records in DNS

### Issue: Database connection failed
**Solutions:**
1. Verify `MYSQL_*` credentials in `.env`
2. Check database exists in DirectAdmin
3. Ensure database user has privileges: `GRANT ALL ON chefs_db.* TO 'user'@'localhost';`
4. Test connection in phpMyAdmin

## Emergency Contacts

- **Hosting Provider:** [Your DirectAdmin hosting support]
- **Developer:** [Your contact info]
- **Database Backup Location:** [Path to backups]
- **DNS Provider:** [Your DNS provider]

## Backup & Recovery

### Create Backup Before Changes
1. Database: Use DirectAdmin MySQL backup
2. Files: Use DirectAdmin file manager backup or FTP download
3. Store backups securely off-site

### Restore from Backup
1. Database: Import SQL file via phpMyAdmin
2. Files: Upload via FTP or DirectAdmin file manager
3. Restart Node.js server
4. Verify functionality

## Documentation Links

- [DirectAdmin Node.js Setup Guide](./DIRECTADMIN_NODE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Admin Dashboard Phases](./ADMIN_DASHBOARD_PHASES.md)
- [Email Configuration](./EMAIL_CONFIGURATION.md)

---

## Final Sign-Off

When all checklist items are complete:

- **Deployment Date:** _________________
- **Deployed By:** _________________
- **Server Status:** [ ] Running [ ] Issues
- **Admin Access:** [ ] Working [ ] Not Working
- **Ready for Production:** [ ] YES [ ] NO

---

**Notes:**
