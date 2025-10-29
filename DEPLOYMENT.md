# Ghana Chef Association - Deployment Guide

This guide provides step-by-step instructions for deploying the Ghana Chef Association registration system on DirectAdmin hosting.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Email Configuration](#email-configuration)
5. [File Upload](#file-upload)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- DirectAdmin hosting account with:
  - MySQL database support
  - PHP 7.4 or higher
  - Email account configured
  - SSL certificate (recommended)
- Supabase account (for backend database and storage)
- Paystack account (for payment processing)

---

## Database Setup

### 1. Create MySQL Database in DirectAdmin

1. Log in to your DirectAdmin panel
2. Navigate to **MySQL Management**
3. Click **Create new database**
4. Enter database details:
   - Database name: `chefs_db` (or your preferred name)
   - Username: Create a new user
   - Password: Generate a strong password
5. Click **Create**

### 2. Import Database Schema

1. In DirectAdmin, go to **phpMyAdmin**
2. Select your newly created database
3. Click the **Import** tab
4. Choose the `database.sql` file from the project
5. Click **Go** to execute the import
6. Verify that all tables were created successfully:
   - `membership_types`
   - `registrations`
   - `registration_documents`
   - `admin_users`
   - `email_notifications`
   - `audit_logs`

### 3. Verify Default Data

Run this query to check if membership types were inserted:

```sql
SELECT * FROM membership_types;
```

You should see 5 membership types: Professional, Corporate, Associate, Vendor, and Student.

---

## Environment Configuration

### 1. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to **Settings** > **API**
3. Copy your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 2. Set Up Paystack

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings** > **API Keys & Webhooks**
3. Copy your:
   - Public Key (for frontend)
   - Secret Key (for backend)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your-public-key-here
PAYSTACK_SECRET_KEY=sk_live_your-secret-key-here

# Database (DirectAdmin MySQL)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=chefs_db
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password

# Email (DirectAdmin)
EMAIL_HOST=mail.chefsghana.com
EMAIL_PORT=587
EMAIL_USER=info@chefsghana.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=info@chefsghana.com
ADMIN_EMAIL=admin@chefsghana.com

# Application
APP_URL=https://chefsghana.com
NODE_ENV=production
```

---

## Email Configuration

### 1. Create Email Account in DirectAdmin

1. Log in to DirectAdmin
2. Navigate to **E-Mail Accounts**
3. Click **Create Account**
4. Create the following accounts:
   - `info@chefsghana.com` (main contact)
   - `admin@chefsghana.com` (receives notifications)
5. Set strong passwords and note them down

### 2. Configure Email Forwarding (Optional)

To ensure you receive all admin notifications:

1. Go to **E-Mail Forwarders**
2. Create a forwarder from `admin@chefsghana.com` to your personal email
3. Test by sending an email to verify forwarding works

### 3. Test Email Functionality

Upload the `api/send-email.php` file to your server and test:

```bash
curl -X POST https://chefsghana.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email.</p>",
    "from": "info@chefsghana.com",
    "fromName": "Ghana Chef Association"
  }'
```

---

## File Upload

### 1. Build the Application

On your local machine:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with optimized files.

### 2. Upload Files to DirectAdmin

#### Option A: Using File Manager

1. Log in to DirectAdmin
2. Navigate to **File Manager**
3. Go to `public_html` (or your domain's root directory)
4. Upload the contents of the `dist/` folder
5. Upload the `api/` folder to the root

#### Option B: Using FTP

1. Connect via FTP using FileZilla or similar:
   - Host: `ftp.chefsghana.com`
   - Username: Your DirectAdmin username
   - Password: Your DirectAdmin password
   - Port: 21
2. Navigate to `public_html`
3. Upload `dist/` contents and `api/` folder

### 3. Set File Permissions

In DirectAdmin File Manager or via SSH:

```bash
# Make API files executable
chmod 755 api/send-email.php

# Ensure proper permissions for uploads directory
mkdir -p uploads
chmod 755 uploads
```

---

## Testing

### 1. Test Frontend

1. Visit your website: `https://chefsghana.com`
2. Verify that:
   - The registration form loads correctly
   - All form fields are visible and functional
   - Date pickers work with year/month selection
   - Terms & Conditions modal opens properly

### 2. Test Registration Flow

1. Complete a test registration:
   - Select a membership type
   - Fill in personal information
   - Complete professional/student details
   - Upload a profile photo
   - Review information
   - Accept terms and conditions
   - Process payment (use Paystack test mode)

2. Verify:
   - Payment is processed successfully
   - Registration is saved to database
   - Membership ID is generated
   - Success message is displayed

### 3. Test Email Notifications

1. Check the admin email (`admin@chefsghana.com`)
2. Verify you received the registration notification
3. Confirm all details are correctly formatted
4. Check that links and formatting work properly

### 4. Database Verification

In phpMyAdmin:

```sql
-- Check latest registration
SELECT * FROM registrations ORDER BY created_at DESC LIMIT 1;

-- Check email notifications
SELECT * FROM email_notifications ORDER BY created_at DESC LIMIT 5;

-- Check audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Troubleshooting

### Email Not Sending

**Problem:** Admin doesn't receive registration notifications

**Solutions:**
1. Check email account credentials in `.env`
2. Verify email account exists in DirectAdmin
3. Check PHP error logs: `tail -f /path/to/error.log`
4. Test email manually using the curl command above
5. Ensure SPF and DKIM records are configured in DirectAdmin DNS

### Database Connection Issues

**Problem:** Cannot connect to MySQL database

**Solutions:**
1. Verify database credentials in `.env`
2. Check database user has proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON chefs_db.* TO 'your_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Ensure database host is correct (usually `localhost`)
4. Check MySQL is running in DirectAdmin

### Payment Processing Errors

**Problem:** Paystack payment fails

**Solutions:**
1. Verify Paystack keys are correct
2. Ensure you're using the right keys (test vs live)
3. Check Paystack dashboard for error logs
4. Verify callback URL is accessible
5. Test with Paystack test cards

### File Upload Issues

**Problem:** Profile photos or documents won't upload

**Solutions:**
1. Check Supabase storage bucket exists
2. Verify storage policies allow uploads
3. Check file size limits in constants
4. Ensure proper CORS configuration in Supabase
5. Check browser console for errors

### Date Picker Not Working

**Problem:** Date picker doesn't show year/month dropdowns

**Solutions:**
1. Clear browser cache
2. Verify all dependencies are installed
3. Check browser console for JavaScript errors
4. Ensure `react-day-picker` version is compatible
5. Test in different browsers

### CORS Errors

**Problem:** API requests blocked by CORS

**Solutions:**
1. Add CORS headers to `api/send-email.php` (already included)
2. Configure `.htaccess` if needed:
   ```apache
   Header set Access-Control-Allow-Origin "*"
   Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
   Header set Access-Control-Allow-Headers "Content-Type"
   ```
3. Ensure API endpoint URL is correct

---

## Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use live Paystack keys (not test keys)
- [ ] Enable SSL certificate (HTTPS)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Disable error display in PHP: `ini_set('display_errors', 0)`
- [ ] Implement rate limiting for API endpoints
- [ ] Regular database backups configured
- [ ] Keep all software updated
- [ ] Monitor error logs regularly
- [ ] Implement proper input validation
- [ ] Use prepared statements for SQL queries

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor email notifications
- Check for failed registrations

**Weekly:**
- Review audit logs
- Check database size
- Verify backup integrity

**Monthly:**
- Update dependencies
- Review and renew expiring memberships
- Generate revenue reports

### Backup Strategy

1. **Database Backups:**
   - Use DirectAdmin's MySQL backup feature
   - Schedule daily automated backups
   - Store backups off-site

2. **File Backups:**
   - Backup uploaded files (profile photos, documents)
   - Use DirectAdmin's backup feature
   - Keep at least 30 days of backups

---

## Support

For issues or questions:

- **Email:** info@chefsghana.com
- **Phone:** +233 24 493 5185 / +233 24 277 7111
- **Website:** https://chefsghana.com

---

## Additional Resources

- [DirectAdmin Documentation](https://docs.directadmin.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Paystack Documentation](https://paystack.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated:** October 2024
